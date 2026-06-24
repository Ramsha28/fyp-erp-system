import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from firebase_admin import auth as fb_auth

from app.database import get_database
from app.models import GroupCreate, GroupApproval, DeadlineModel, BulkApprovalModel
from app.auth import get_current_user, verify_role

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

def serialize_doc(doc) -> dict:
    if not doc:
        return {}
    doc["_id"] = str(doc["_id"])
    return doc 
@router.post("/auth/sync-role")
async def sync_role(payload: dict):
    uid = payload.get("uid")
    role = payload.get("role")
    if role not in ["student", "manager"]:
        raise HTTPException(status_code=400, detail="Invalid role value")
    try:
        fb_auth.set_custom_user_claims(uid, {"role": role})
        logger.info(f"Custom claims role updated for UID {uid}: {role}")
        return {"status": "success", "role": role}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/groups/create")
async def create_group(group_in: GroupCreate, user: dict = Depends(verify_role("student"))):
    db = get_database()
    
    deadline_cfg = await db.configs.find_one({"type": "deadline"})
    if deadline_cfg:
        dl_date = datetime.fromisoformat(deadline_cfg["value"])
        if datetime.utcnow() > dl_date:
            raise HTTPException(status_code=400, detail="The deadline for group submission has passed")

    existing_group = await db.groups.find_one({"members": user["email"]})
    if existing_group:
         raise HTTPException(status_code=400, detail="You are already a member of an active group")

    new_group = {
        "name": group_in.name,
        "topic": group_in.topic,
        "members": group_in.members,
        "creator_email": user["email"],
        "status": "pending",
        "supervisor": None,
        "created_at": datetime.utcnow()
    }
    
    result = await db.groups.insert_one(new_group)
    
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "action": "CREATE_GROUP",
        "actor": user["email"],
        "entity_id": str(result.inserted_id),
        "details": f"Group '{group_in.name}' created by student."
    })
    
    return {"status": "success", "group_id": str(result.inserted_id)}

@router.get("/groups/my")
async def get_my_group(user: dict = Depends(verify_role("student"))):
    db = get_database()
    group = await db.groups.find_one({"members": user["email"]})
    if not group:
         raise HTTPException(status_code=404, detail="No group membership found for user")
    return serialize_doc(group)
@router.get("/groups/all", response_model=List[dict])
async def get_all_groups(user: dict = Depends(verify_role("manager"))):
    db = get_database()
    cursor = db.groups.find()
    groups = await cursor.to_list(length=100)
    return [serialize_doc(g) for g in groups]

@router.post("/groups/{group_id}/approve")
async def approve_group(group_id: str, approval: GroupApproval, user: dict = Depends(verify_role("manager"))):
    db = get_database()
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid Group ID format")
    
    result = await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$set": {"status": "approved", "supervisor": approval.supervisor}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
        
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "action": "APPROVE_GROUP",
        "actor": user["email"],
        "entity_id": group_id,
        "details": f"Group approved. Supervisor '{approval.supervisor}' assigned."
    })
    return {"status": "approved", "supervisor": approval.supervisor}

@router.post("/groups/{group_id}/reject")
async def reject_group(group_id: str, user: dict = Depends(verify_role("manager"))):
    db = get_database()
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid Group ID format")
    
    result = await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$set": {"status": "rejected", "supervisor": None}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
        
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "action": "REJECT_GROUP",
        "actor": user["email"],
        "entity_id": group_id,
        "details": "Group rejected."
    })
    return {"status": "rejected"}
@router.get("/groups/analytics")
async def get_analytics(user: dict = Depends(verify_role("manager"))):
    db = get_database()
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    cursor = db.groups.aggregate(pipeline)
    results = await cursor.to_list(length=10)
    
    counts = {"pending": 0, "approved": 0, "rejected": 0, "total": 0}
    for res in results:
        status_name = res["_id"]
        counts[status_name] = res["count"]
        counts["total"] += res["count"]
        
    sup_pipeline = [
        {"$match": {"supervisor": {"$ne": None}}},
        {"$group": {"_id": "$supervisor", "count": {"$sum": 1}}}
    ]
    sup_cursor = db.groups.aggregate(sup_pipeline)
    sup_results = await sup_cursor.to_list(length=50)
    supervisors_data = [{"name": r["_id"], "count": r["count"]} for r in sup_results]
    
    return {"counts": counts, "supervisors": supervisors_data}

@router.get("/groups/audit-logs", response_model=List[dict])
async def get_audit_logs(user: dict = Depends(verify_role("manager"))):
    db = get_database()
    logs = await db.audit_logs.find().sort("timestamp", -1).to_list(length=100)
    return [serialize_doc(log) for log in logs]

@router.post("/groups/deadline")
async def set_deadline(payload: DeadlineModel, user: dict = Depends(verify_role("manager"))):
    db = get_database()
    await db.configs.update_one(
        {"type": "deadline"},
        {"$set": {"value": payload.deadline_date.isoformat()}},
        upsert=True
    )
    return {"status": "success", "deadline": payload.deadline_date}

@router.get("/groups/deadline")
async def get_deadline():
    db = get_database()
    cfg = await db.configs.find_one({"type": "deadline"})
    if not cfg:
        return {"deadline": None}
    return {"deadline": cfg["value"]}

@router.post("/groups/bulk-approve")
async def bulk_approve(payload: BulkApprovalModel, user: dict = Depends(verify_role("manager"))):
    db = get_database()
    object_ids = [ObjectId(gid) for gid in payload.group_ids if ObjectId.is_valid(gid)]
    if not object_ids:
         raise HTTPException(status_code=400, detail="No valid group IDs provided")
         
    await db.groups.update_many(
        {"_id": {"$in": object_ids}},
        {"$set": {"status": "approved", "supervisor": payload.supervisor}}
    )
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "action": "BULK_APPROVE",
        "actor": user["email"],
        "details": f"Bulk approved groups: {payload.group_ids} with Supervisor '{payload.supervisor}'"
    })
    return {"status": "success", "approved_count": len(object_ids)}

@router.get("/groups/performance")
async def get_performance(user: dict = Depends(verify_role("manager"))):
    db = get_database()
    start_time = time.perf_counter()
    await db.command("ping")
    db_latency = (time.perf_counter() - start_time) * 1000
    return {
        "db_latency_ms": round(db_latency, 2),
        "status": "healthy"
    }