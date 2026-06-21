# fyp-erp-system
# FYP ERP System: Zero-Ambiguity DevOps Simulation Guide
## Project: Final Year Project Management System (Role-Based Edition)
### Created for: Ramsha Naveed (DevOps Lead), Khadijah Zahoor (Backend Engineer), Sara Haider (Frontend Engineer)

This document is a comprehensive, production-grade lab manual and codebase guide. It contains all setup instructions, shell commands, complete file contents, configurations, CI/CD pipeline definitions, and deployment guides required to construct, run, containerize, orchestrate, and deploy the FYP ERP System from scratch.

---

## 👥 ROLE ASSIGNMENTS & HANDOFF TIMELINE

To run this simulation successfully, follow this chronological sequence of checkpoints:

```
[CHRONOLOGICAL SIMULATION PIPELINE]

┌──────────────────────────────────────────────────────────────┐
│ CHECKPOINT 1: Initial Setup & Repository Structure            │
│ OWNER: Ramsha Naveed (DevOps Lead)                           │
│ Tasks: Account setup, Git repo creation, and folder layout.  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CHECKPOINT 2: Local Codebase Development                     │
│ OWNERS: Khadijah Zahoor (Backend) & Sara Haider (Frontend)    │
│ Tasks: Base code implementation, local env configuration.    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CHECKPOINT 3: Branching & Feature PR Submissions             │
│ OWNERS: Khadijah & Sara -> Ramsha                            │
│ Tasks: Push features, submit pull requests to develop.       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CHECKPOINT 4: Review, Merge, & Containerization              │
│ OWNER: Ramsha Naveed (DevOps Lead)                           │
│ Tasks: Review PRs, run CI/CD tests, push Docker images.      │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CHECKPOINT 5: Local Kubernetes & Cloud Deployments           │
│ OWNER: Ramsha Naveed (DevOps Lead)                           │
│ Tasks: Apply K8s manifests, deploy to Render & Vercel.       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CHECKPOINT 6: Joint System Validation & Demo                 │
│ OWNERS: Entire Team (Ramsha, Khadijah, Sara)                 │
│ Tasks: Execute full scenario walkthrough and record script.   │
└──────────────────────────────────────────────────────────────┘
```

---

## SECRET KEY / CREDENTIALS CHECKSUMS & VALUES REFERENCE

| Environment Variable Name | Provider Source | Target Destination | Description / Purpose | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Console | Backend `.env`, K8s Secrets, Render Env | Connection string for Atlas cluster | `mongodb+srv://fyp-user:SafePass123@fyp-erp-cluster.abcde.mongodb.net/fyp-erp-db?retryWrites=true&w=majority` |
| `FIREBASE_PROJECT_ID` | Firebase Console | Backend & Frontend `.env`, Render/Vercel Env | Firebase project identification string | `fyp-erp-system` |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK Settings | Backend `.env`, K8s Secrets, Render Env | Private certificate key for JWT verification | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK Settings | Backend `.env`, K8s Secrets, Render Env | Client service email for Admin SDK | `firebase-adminsdk-xxxxx@fyp-erp-system.iam.gserviceaccount.com` |
| `VITE_FIREBASE_API_KEY` | Firebase Web App Settings | Frontend `.env`, Vercel Env | Firebase Client Authentication API Key | `AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Web App Settings | Frontend `.env`, Vercel Env | Auth redirect domain URL | `fyp-erp-system.firebaseapp.com` |
| `VITE_API_URL` | Cloud / Local Host URL | Frontend `.env`, Vercel Env | Gateway URL pointing to backend API | Local: `http://localhost:8000`, Prod: `https://fyp-backend.onrender.com` |
| `DOCKER_USERNAME` | DockerHub Profile | GitHub Repository Secrets | Docker Registry account name for pushes | `ramshadevops` |
| `DOCKER_PASSWORD` | DockerHub Security | GitHub Repository Secrets | Account password or Access Token for DockerHub | `dckr_pat_A1B2C3D4E5F6G7H8I9J0K1L2M3` |

---

## 🏁 CHECKPOINT 1: INITIAL SETUP & REPOSITORY STRUCTURE
### 👤 OWNER: Ramsha Naveed (DevOps Lead)

*Ramsha must execute these steps first to set up accounts, create the shared GitHub repository, configure free-tier cloud settings, and lay out the directory structure.*

### Step 1: Cloud & Accounts Provisioning
1. **GitHub**: Log in to [GitHub](https://github.com). Click the **+** icon in the top-right corner and select **New repository**. Name it `fyp-erp-system`. Choose **Public** visibility. Leave README, gitignore, and license **unchecked**. Click **Create repository**.
2. **Firebase Console**: Go to the [Firebase Console](https://console.firebase.google.com). Click **Add project** and name it `fyp-erp-system`.
   * Enable **Email/Password** sign-in under **Build > Authentication > Sign-in method**.
   * Go to **Project Settings > Service accounts**, click **Generate new private key** to download the JSON credentials file.
   * Go to **Project Settings > General**, scroll to **Your apps**, click the web icon `</>` to register a web app named `fyp-erp-ui`, and copy the web credentials config block.
3. **MongoDB Atlas**: Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Click **Create Project**, name it `fyp-erp-project`.
   * Deploy a database under the **M0 Free Tier** cluster named `fyp-erp-cluster`.
   * Add username `fyp-user` with password `SafePass123` in Database Access.
   * Set IP Access List to `0.0.0.0/0` in Network Access.
   * Copy the connection string under **Connect > Drivers**.
4. **DockerHub**: Log in to [DockerHub](https://hub.docker.com). Create two public repositories: `fyp-backend` and `fyp-frontend`.
5. **Render & Vercel**: Sign up for free accounts on [Render](https://render.com) and [Vercel](https://vercel.com) using your GitHub account.

### Step 2: Directory Layout Construction
Run the following terminal commands to create the folder hierarchy and empty configuration templates:
```bash
# Create the root project directory and navigate inside
mkdir fyp-erp-system
cd fyp-erp-system

# Create Backend structure
mkdir -p backend/app

# Create Frontend structure
mkdir -p frontend/src/components

# Create Kubernetes manifests folder
mkdir k8s

# Create GitHub Actions workflow folder
mkdir -p .github/workflows

# Create baseline empty files
touch backend/app/__init__.py backend/app/main.py backend/app/database.py backend/app/auth.py backend/app/models.py backend/app/routes.py backend/requirements.txt backend/.env backend/.env.example
touch frontend/src/components/Login.jsx frontend/src/components/StudentDashboard.jsx frontend/src/components/ManagerDashboard.jsx frontend/src/components/ProtectedRoute.jsx
touch frontend/src/firebase.js frontend/src/App.jsx frontend/src/index.css frontend/src/main.jsx frontend/index.html frontend/package.json frontend/vite.config.js frontend/.env frontend/.env.example
touch k8s/backend-deployment.yaml k8s/backend-service.yaml k8s/frontend-deployment.yaml k8s/frontend-service.yaml k8s/mongo-deployment.yaml k8s/mongo-service.yaml k8s/secrets.yaml k8s/ingress.yaml
touch .github/workflows/backend.yml .github/workflows/frontend.yml
touch docker-compose.yml README.md
```

### Step 3: Initialize Git and Push Base to GitHub
```bash
git init
git add .
git commit -m "chore: initialize fyp-erp-system repository structure"
git branch -M main
git remote add origin https://github.com/<your-github-username>/fyp-erp-system.git
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```
*Once Ramsha pushes the `develop` branch, Sara and Khadijah can clone the repository to implement their respective features.*

---

## 💻 CHECKPOINT 2: LOCAL CODEBASE DEVELOPMENT
### 👤 OWNERS: Khadijah Zahoor (Backend) & Sara Haider (Frontend)

*Khadijah and Sara clone the repository, check out feature branches, and copy-paste their respective stack implementations.*

### 1. BACKEND CODEBASE (Khadijah Zahoor)
*Khadijah checks out branch `feature/backend/core-logic` and populates the backend files:*
```bash
git checkout develop
git pull origin develop
git checkout -b feature/backend/core-logic
```

#### [backend/requirements.txt](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/requirements.txt)
```txt
fastapi==0.111.0
uvicorn==0.30.1
motor==3.4.0
pydantic==2.7.4
firebase-admin==6.5.0
python-dotenv==1.0.1
dnspython==2.6.1
pydantic-settings==2.3.4
```

#### [backend/.env.example](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/.env.example)
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
FIREBASE_PROJECT_ID=fyp-erp-system
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fyp-erp-system.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
```

#### [backend/app/database.py](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/app/database.py)
```python
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI env variable is not set!")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    db_instance.client = AsyncIOMotorClient(MONGODB_URI)
    db_instance.db = db_instance.client.get_database("fyp_erp")
    logger.info("Connected to MongoDB database: fyp_erp")

def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db
```

#### [backend/app/models.py](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/app/models.py)
```python
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    topic: str = Field(..., min_length=3, max_length=150)
    members: List[str] = Field(..., min_items=1, max_items=4)

class GroupResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    topic: str
    members: List[str]
    creator_email: str
    status: str  # pending, approved, rejected
    supervisor: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True

class GroupApproval(BaseModel):
    supervisor: str = Field(..., min_length=2, max_length=100)

class DeadlineModel(BaseModel):
    deadline_date: datetime

class BulkApprovalModel(BaseModel):
    group_ids: List[str]
    supervisor: str
```

#### [backend/app/auth.py](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/app/auth.py)
```python
import os
import json
import logging
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
firebase_client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
firebase_private_key = os.getenv("FIREBASE_PRIVATE_KEY")

if firebase_project_id and firebase_client_email and firebase_private_key:
    # Handle escaping of newlines in Docker/Render variables
    formatted_key = firebase_private_key.replace("\\n", "\n")
    cred_dict = {
        "type": "service_account",
        "project_id": firebase_project_id,
        "private_key": formatted_key,
        "client_email": firebase_client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    try:
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK successfully initialized.")
    except Exception as e:
        logger.error(f"Error initializing Firebase Admin SDK: {e}")
else:
    logger.warning("Firebase Admin variables not set. Auth verification will fail.")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        # Decodes and verifies the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "role": decoded_token.get("role", "student")  # default role to student if none set
        }
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired authentication credentials")

def verify_role(required_role: str):
    async def role_checker(user: dict = Security(get_current_user)):
        if user.get("role") != required_role:
            raise HTTPException(status_code=403, detail="Operation not permitted for this user role")
        return user
    return role_checker
```

#### [backend/app/routes.py](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/app/routes.py)
```python
import time
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from firebase_admin import auth as fb_auth

from app.database import get_database
from app.models import GroupCreate, GroupResponse, GroupApproval, DeadlineModel, BulkApprovalModel
from app.auth import get_current_user, verify_role

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

# Helper to serialize Mongo documents
def serialize_doc(doc) -> dict:
    if not doc:
        return {}
    doc["_id"] = str(doc["_id"])
    return doc

# Register User & Assign Custom Claims Role endpoint (Administrative)
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

# ==================== STUDENT ROUTERS ====================

@router.post("/groups/create", response_model=dict)
async def create_group(group_in: GroupCreate, user: dict = Depends(verify_role("student"))):
    db = get_database()
    
    # Check if a deadline exists and has passed
    deadline_cfg = await db.configs.find_one({"type": "deadline"})
    if deadline_cfg:
        dl_date = datetime.fromisoformat(deadline_cfg["value"])
        if datetime.utcnow() > dl_date:
            raise HTTPException(status_code=400, detail="The deadline for group submission has passed")

    # Check if user already created/belongs to a group
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
    
    # Save Audit Log
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "action": "CREATE_GROUP",
        "actor": user["email"],
        "entity_id": str(result.inserted_id),
        "details": f"Group '{group_in.name}' created by student."
    })
    
    return {"status": "success", "group_id": str(result.inserted_id)}

@router.get("/groups/my", response_model=dict)
async def get_my_group(user: dict = Depends(verify_role("student"))):
    db = get_database()
    group = await db.groups.find_one({"members": user["email"]})
    if not group:
         raise HTTPException(status_code=404, detail="No group membership found for user")
    return serialize_doc(group)


# ==================== MANAGER (COORDINATOR) ROUTERS ====================

@router.get("/groups/all", response_model=List[dict])
async def get_all_groups(user: dict = Depends(verify_role("manager"))):
    db = get_database()
    cursor = db.groups.find()
    groups = await cursor.to_list(length=100)
    return [serialize_doc(g) for g in groups]

@router.post("/groups/{group_id}/approve", response_model=dict)
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

@router.post("/groups/{group_id}/reject", response_model=dict)
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

# ==================== INCREMENTAL FEATURES ROUTERS ====================

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
        
    # Get Supervisor distributions
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
    # Log bulk event
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
    # Execute dry-run Mongo command to measure round-trip latency
    await db.command("ping")
    db_latency = (time.perf_counter() - start_time) * 1000  # in ms
    return {
        "db_latency_ms": round(db_latency, 2),
        "status": "healthy"
    }
```

#### [backend/app/main.py](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/app/main.py)
```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import router

app = FastAPI(
    title="FYP ERP System API",
    description="Back-end services for Final Year Project management",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to production frontend urls on staging/prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    connect_to_mongo()

@app.on_event("shutdown")
def shutdown_db_client():
    close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "FYP ERP System API v1.0 running successfully."}

app.include_router(router)
```

---

### 2. FRONTEND CODEBASE (Sara Haider)
*Sara checks out branch `feature/frontend/ui-views` and populates the React/Vite files:*
```bash
git checkout develop
git pull origin develop
git checkout -b feature/frontend/ui-views
```

#### [frontend/package.json](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/package.json)
```json
{
  "name": "fyp-erp-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "firebase": "^10.12.2",
    "lucide-react": "^0.395.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.2",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "vite": "^5.2.11"
  }
}
```

#### [frontend/vite.config.js](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
```

#### [frontend/index.html](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/index.html)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FYP ERP System</title>
    <!-- Icons styling -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### [frontend/.env.example](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/.env.example)
```env
VITE_FIREBASE_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
VITE_FIREBASE_AUTH_DOMAIN=fyp-erp-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fyp-erp-system
VITE_API_URL=http://localhost:8000
```

#### [frontend/src/firebase.js](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/firebase.js)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### [frontend/src/main.jsx](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/main.jsx)
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### [frontend/src/index.css](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/index.css)
```css
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-background-tertiary: #f3f4f6;
  --color-border-primary: #e5e7eb;
  --color-border-secondary: #d1d5db;
  --color-border-tertiary: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --border-radius-md: 6px;
  --border-radius-lg: 10px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-background-tertiary);
  color: var(--color-text-primary);
}

.app {
  display: flex;
  height: 100vh;
  min-height: 600px;
  background: var(--color-background-tertiary);
  font-size: 14px;
}

.sidebar {
  width: 240px;
  background: var(--color-background-primary);
  border-right: 0.5px solid var(--color-border-tertiary);
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 0.5px solid var(--color-border-tertiary);
}

.sidebar-logo {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.sidebar-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.role-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 8px;
  border-radius: var(--border-radius-md);
  font-size: 11px;
  font-weight: 500;
}

.role-student {
  background: #EEEDFE;
  color: #3C3489;
}

.role-manager {
  background: #E1F5EE;
  color: #085041;
}

.nav {
  padding: 8px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 13px;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-background-secondary);
  color: #534AB7;
  border-left-color: #534AB7;
  font-weight: 500;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  background: var(--color-background-primary);
  border-bottom: 0.5px solid var(--color-border-tertiary);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #EEEDFE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #534AB7;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  padding: 14px;
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 3px;
}

.card {
  background: var(--color-background-primary);
  border-radius: var(--border-radius-lg);
  border: 0.5px solid var(--color-border-tertiary);
  padding: 18px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 0.5px solid var(--color-border-tertiary);
}

.table td {
  padding: 12px 8px;
  border-bottom: 0.5px solid var(--color-border-tertiary);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--border-radius-md);
  font-size: 11px;
  font-weight: 500;
}

.s-pending {
  background: #FAEEDA;
  color: #633806;
}

.s-approved {
  background: #EAF3DE;
  color: #27500A;
}

.s-rejected {
  background: #FCEBEB;
  color: #791F1F;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--border-radius-md);
  border: 0.5px solid var(--color-border-secondary);
  font-size: 12px;
  cursor: pointer;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  transition: all 0.1s;
}

.btn:hover {
  background: var(--color-background-secondary);
}

.btn-approve {
  background: #EAF3DE;
  color: #27500A;
  border-color: #C0DD97;
}

.btn-reject {
  background: #FCEBEB;
  color: #791F1F;
  border-color: #F7C1C1;
}

.btn-primary {
  background: #534AB7;
  color: white;
  border-color: #534AB7;
}

.btn-primary:hover {
  background: #3C3489;
}

.member-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 3px;
}

.form-row {
  margin-bottom: 14px;
}

.form-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  display: block;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  font-size: 13px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.pipe-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 20px;
}

.pipe-step {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
  background: var(--color-background-secondary);
  font-size: 11px;
  color: var(--color-text-secondary);
  position: relative;
  border: 0.5px solid var(--color-border-tertiary);
}

.pipe-step:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  z-index: 1;
  font-size: 12px;
}

.pipe-step.done {
  background: #EAF3DE;
  color: #27500A;
}

.pipe-step.active-step {
  background: #EEEDFE;
  color: #3C3489;
  font-weight: 500;
}

.notif {
  padding: 8px 12px;
  border-radius: var(--border-radius-md);
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-info {
  background: #E6F1FB;
  color: #0C447C;
}

.notif-success {
  background: #EAF3DE;
  color: #27500A;
}

/* Authentication Containers */
.auth-container {
  max-width: 400px;
  margin: 100px auto;
  background: var(--color-background-primary);
  padding: 30px;
  border-radius: var(--border-radius-lg);
  border: 0.5px solid var(--color-border-tertiary);
}

.auth-header {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.auth-link {
  font-size: 12px;
  color: #534AB7;
  cursor: pointer;
  text-align: center;
  display: block;
  margin-top: 15px;
}
```

#### [frontend/src/components/ProtectedRoute.jsx](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/components/ProtectedRoute.jsx)
```javascript
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Force refresh the token to retrieve custom claims
        const idTokenResult = await currentUser.getIdTokenResult(true);
        setRole(idTokenResult.claims.role || 'student');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Authenticating user session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#791F1F' }}>Access Denied: Unauthorized Permission</div>;
  }

  return children;
}
```

#### [frontend/src/components/Login.jsx](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/components/Login.jsx)
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isRegister) {
        // Register in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Sync role claims on the Backend Admin API
        await axios.post(`${API_URL}/api/auth/sync-role`, {
          uid: user.uid,
          role: role
        });

        // Force token refresh on Firebase side to update current claims local state
        await user.getIdToken(true);
        setMessage('Registration successful! Logging in...');
        setTimeout(() => {
          if (role === 'manager') {
            navigate('/manager');
          } else {
            navigate('/student');
          }
        }, 1500);
      } else {
        // Login flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idTokenResult = await user.getIdTokenResult(true);
        const userRole = idTokenResult.claims.role || 'student';
        
        if (userRole === 'manager') {
          navigate('/manager');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-header">{isRegister ? 'Register Account' : 'Portal Sign In'}</h2>
      {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', fontSize: '12px', marginBottom: '10px' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {isRegister && (
          <div className="form-row">
            <label className="form-label">Account Role</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="manager">FYP Coordinator (Manager)</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
          {isRegister ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      <span className="auth-link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Sign in' : 'New user? Create a profile'}
      </span>
    </div>
  );
}
```

#### [frontend/src/components/StudentDashboard.jsx](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/components/StudentDashboard.jsx)
```javascript
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

export default function StudentDashboard() {
  const [group, setGroup] = useState(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [members, setMembers] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchGroup = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/api/groups/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(res.data);
    } catch (err) {
      setGroup(null);
    }
  };

  const fetchDeadline = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups/deadline`);
      if (res.data.deadline) {
        setDeadline(new Date(res.data.deadline));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchDeadline();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = await auth.currentUser.getIdToken();
      const membersList = members.split(',').map(m => m.trim()).filter(m => m !== '');
      membersList.push(auth.currentUser.email); // Auto-include self
      
      await axios.post(`${API_URL}/api/groups/create`, {
        name,
        topic,
        members: membersList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('FYP Group registered successfully!');
      fetchGroup();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo"><i className="ti ti-school"></i> FYP ERP</div>
          <div className="sidebar-sub">University Portal</div>
          <span className="role-badge role-student">Student</span>
        </div>
        <nav className="nav">
          <div className="nav-item active"><i className="ti ti-layout-dashboard"></i> Dashboard</div>
        </nav>
        <div style={{ padding: '16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">Student Dashboard</div>
          <div className="topbar-right">
            <div className="avatar">ST</div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{auth.currentUser?.email}</span>
          </div>
        </div>

        <div className="content">
          {deadline && (
            <div className="notif notif-info">
              <i className="ti ti-info-circle"></i>
              Submission Deadline set to: {deadline.toLocaleString()}
            </div>
          )}

          {group ? (
            <div>
              <div className="pipe-steps">
                <div className="pipe-step done">Group Created</div>
                <div className="pipe-step done">Topic Submitted</div>
                <div className={`pipe-step ${group.status === 'pending' ? 'active-step' : 'done'}`}>Under Review</div>
                <div className={`pipe-step ${group.status === 'approved' ? 'active-step' : ''} ${group.status === 'rejected' ? 's-rejected' : ''}`}>Approved</div>
                <div className={`pipe-step ${group.supervisor ? 'done' : ''}`}>Supervisor Assigned</div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Group</div>
                  <div className="stat-value">{group.name}</div>
                  <div className="stat-sub">{group.members?.length} members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Status</div>
                  <div className="stat-value" style={{ fontSize: '16px', color: group.status === 'approved' ? '#27500A' : group.status === 'rejected' ? '#791F1F' : '#BA7517' }}>
                    {group.status.toUpperCase()}
                  </div>
                  <div className="stat-sub">{group.status === 'pending' ? 'Awaiting coordinator' : 'Decision final'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Topic</div>
                  <div className="stat-value" style={{ fontSize: '14px' }}>{group.topic}</div>
                  <div className="stat-sub">Submitted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Supervisor</div>
                  <div className="stat-value" style={{ fontSize: '14px', color: group.supervisor ? '#111827' : 'var(--color-text-secondary)' }}>
                    {group.supervisor || 'TBA'}
                  </div>
                  <div className="stat-sub">Assigned on approval</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Registered Group Members</div>
                <div>
                  {group.members?.map((mem, idx) => (
                    <span className="member-chip" key={idx}><i className="ti ti-user"></i> {mem}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-title">Register FYP Group</div>
              {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
              {success && <div style={{ color: 'green', fontSize: '12px', marginBottom: '10px' }}>{success}</div>}
              <form onSubmit={handleCreateGroup}>
                <div className="form-row">
                  <label className="form-label">Group Name</label>
                  <input className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project Alpha" />
                </div>
                <div className="form-row">
                  <label className="form-label">Project Topic</label>
                  <input className="form-input" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI-Based grading engine" />
                </div>
                <div className="form-row">
                  <label className="form-label">Teammate Emails (comma-separated, excluding yourself)</label>
                  <input className="form-input" value={members} onChange={(e) => setMembers(e.target.value)} placeholder="sara@uni.edu, khadijah@uni.edu" />
                </div>
                <button type="submit" className="btn btn-primary">Submit Group Registration</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### [frontend/src/components/ManagerDashboard.jsx](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/components/ManagerDashboard.jsx)
```javascript
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

export default function ManagerDashboard() {
  const [groups, setGroups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dbLatency, setDbLatency] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [supervisorAssign, setSupervisorAssign] = useState({});
  const [bulkSupervisor, setBulkSupervisor] = useState('');
  const [selectedGroups, setSelectedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('manage'); // manage, analytics, audit
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const resGroups = await axios.get(`${API_URL}/api/groups/all`, config);
      setGroups(resGroups.data);

      const resAnalytics = await axios.get(`${API_URL}/api/groups/analytics`, config);
      setAnalytics(resAnalytics.data);

      const resAudit = await axios.get(`${API_URL}/api/groups/audit-logs`, config);
      setAuditLogs(resAudit.data);

      const resPerf = await axios.get(`${API_URL}/api/groups/performance`, config);
      setDbLatency(resPerf.data.db_latency_ms);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (groupId) => {
    const supervisor = supervisorAssign[groupId] || 'Unassigned';
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/${groupId}/approve`, { supervisor }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Group Approved Successfully');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (groupId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/${groupId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Group Rejected');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDeadline = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/deadline`, {
        deadline_date: new Date(deadline).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Submission Deadline updated');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkApprove = async () => {
    const groupIds = Object.keys(selectedGroups).filter(id => selectedGroups[id]);
    if (groupIds.length === 0 || !bulkSupervisor) {
      alert("Please select groups and enter a supervisor name");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/bulk-approve`, {
        group_ids: groupIds,
        supervisor: bulkSupervisor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Bulk approval process completed');
      setSelectedGroups({});
      setBulkSupervisor('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo"><i className="ti ti-school"></i> FYP ERP</div>
          <div className="sidebar-sub">Coordinator Console</div>
          <span className="role-badge role-manager">Manager</span>
        </div>
        <nav className="nav">
          <div className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}><i className="ti ti-adjustments"></i> Manage Groups</div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><i className="ti ti-chart-bar"></i> Analytics</div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><i className="ti ti-history"></i> Audit Logs</div>
        </nav>
        <div style={{ padding: '16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: '11px', color: 'green', marginBottom: '10px' }}><i className="ti ti-server"></i> DB Latency: {dbLatency}ms</div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">FYP Coordinator Panel</div>
          <div className="topbar-right">
            <div className="avatar">RN</div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Ramsha Naveed</span>
          </div>
        </div>

        <div className="content">
          {message && <div className="notif notif-success"><i className="ti ti-check"></i> {message}</div>}

          {activeTab === 'manage' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card"><div class="stat-label">Total Groups</div><div class="stat-value">{analytics?.counts?.total || 0}</div></div>
                <div className="stat-card"><div class="stat-label">Pending</div><div class="stat-value" style={{ color: '#BA7517' }}>{analytics?.counts?.pending || 0}</div></div>
                <div className="stat-card"><div class="stat-label">Approved</div><div class="stat-value" style={{ color: '#27500A' }}>{analytics?.counts?.approved || 0}</div></div>
                <div className="stat-card"><div class="stat-label">Rejected</div><div class="stat-value" style={{ color: '#791F1F' }}>{analytics?.counts?.rejected || 0}</div></div>
              </div>

              <div className="card">
                <div className="card-title">Set Submission Deadline Limit</div>
                <form onSubmit={handleSetDeadline} style={{ display: 'flex', gap: '10px' }}>
                  <input className="form-input" type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Save Deadline</button>
                </form>
              </div>

              <div className="card">
                <div className="card-title">Group Registrations & Pipeline Approval</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Group Name</th>
                      <th>Topic</th>
                      <th>Members</th>
                      <th>Status</th>
                      <th>Supervisor Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((grp) => (
                      <tr key={grp._id}>
                        <td>
                          {grp.status === 'pending' && (
                            <input type="checkbox" checked={!!selectedGroups[grp._id]} onChange={(e) => setSelectedGroups({ ...selectedGroups, [grp._id]: e.target.checked })} />
                          )}
                        </td>
                        <td style={{ fontWeight: '500' }}>{grp.name}</td>
                        <td>{grp.topic}</td>
                        <td>
                          {grp.members?.map((m, i) => (
                            <div key={i} style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{m}</div>
                          ))}
                        </td>
                        <td>
                          <span className={`status ${grp.status === 'approved' ? 's-approved' : grp.status === 'rejected' ? 's-rejected' : 's-pending'}`}>
                            {grp.status}
                          </span>
                        </td>
                        <td>
                          {grp.status === 'pending' ? (
                            <input className="form-input" type="text" placeholder="e.g. Dr. Aamir" value={supervisorAssign[grp._id] || ''} onChange={(e) => setSupervisorAssign({ ...supervisorAssign, [grp._id]: e.target.value })} />
                          ) : (
                            grp.supervisor || 'None'
                          )}
                        </td>
                        <td>
                          {grp.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button className="btn btn-approve" onClick={() => handleApprove(grp._id)}><i className="ti ti-check"></i></button>
                              <button className="btn btn-reject" onClick={() => handleReject(grp._id)}><i className="ti ti-x"></i></button>
                            </div>
                          ) : (
                            <span>Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="card-title">Bulk Approve Actions</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input className="form-input" type="text" placeholder="Bulk Supervisor Name" value={bulkSupervisor} onChange={(e) => setBulkSupervisor(e.target.value)} />
                  <button className="btn btn-approve" onClick={handleBulkApprove}>Bulk Approve Checked</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div>
              <div className="card">
                <div className="card-title">Status Breakdown</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#EAF3DE" strokeWidth="20" />
                    <text x="60" y="66" textAnchor="middle" fontSize="18" fontWeight="600">{analytics.counts.total}</text>
                  </svg>
                  <div>
                    <div>Approved: {analytics.counts.approved}</div>
                    <div>Pending: {analytics.counts.pending}</div>
                    <div>Rejected: {analytics.counts.rejected}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Supervisor Assignment Distribution Load</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Supervisor Name</th>
                      <th>Assigned Groups Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.supervisors?.map((sup, idx) => (
                      <tr key={idx}>
                        <td>{sup.name}</td>
                        <td>{sup.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card">
              <div className="card-title">Approval Pipeline Audit Trail Logs</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td><strong>{log.action}</strong></td>
                      <td>{log.actor}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### [frontend/src/App.jsx](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/src/App.jsx)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/student" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
```

---

## 🚀 CHECKPOINT 3: BRANCHING & FEATURE PR SUBMISSIONS
### 👤 OWNERS: Khadijah Zahoor (Backend) & Sara Haider (Frontend) -> Ramsha Naveed (DevOps Lead)

*Once Khadijah and Sara have copy-pasted and verified their files locally, they must push their changes to the remote repository and submit Pull Requests.*

### Step 1: Khadijah Pushes Backend Feature Branch
```bash
cd backend
# Verify syntax correctness locally
python -m py_compile app/main.py app/routes.py

# Commit and push
git add .
git commit -m "feat(backend): implement FastAPI core logic, analytics, & auth middleware"
git push origin feature/backend/core-logic
```
*Khadijah goes to GitHub, opens a Pull Request: `feature/backend/core-logic` -> `develop`.*

### Step 2: Sara Pushes Frontend Feature Branch
```bash
cd frontend
# Verify build bundle compiles cleanly
npm run build

# Commit and push
git add .
git commit -m "feat(frontend): implement React portals, routing claims, and css style matching"
git push origin feature/frontend/ui-views
```
*Sara goes to GitHub, opens a Pull Request: `feature/frontend/ui-views` -> `develop`.*

---

## 🛡️ CHECKPOINT 4: REVIEW, MERGE, & CONTAINERIZATION
### 👤 OWNER: Ramsha Naveed (DevOps Lead)

*Ramsha acts as the sole merge authority. She reviews the PRs, merges them into `develop`, and sets up Docker files and automated workflows to build and register the containers.*

### Step 1: Code Review and Merge
1. Log in to GitHub. Go to the `fyp-erp-system` repository.
2. Under the **Pull Requests** tab, review Khadijah's and Sara's PRs.
3. Once verified, click **Merge pull request** to integrate the code into the `develop` branch.

### Step 2: Configure Infrastructure Dockerfiles
*Ramsha pulls the latest `develop` branch locally and copy-pastes the containerization files:*
```bash
git checkout develop
git pull origin develop
git checkout -b feature/devops/containerization
```

#### [backend/Dockerfile](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/backend/Dockerfile)
```dockerfile
FROM python:3.10-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.10-slim as runner
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### [frontend/Dockerfile](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/frontend/Dockerfile)
```dockerfile
# Multi-stage production container for Frontend React static distribution
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_API_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Setup basic nginx configuration for Single Page Routing fallback
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### [docker-compose.yml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/docker-compose.yml)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - MONGODB_URI=mongodb+srv://fyp-user:SafePass123@fyp-erp-cluster.abcde.mongodb.net/fyp-erp-db?retryWrites=true&w=majority
      - FIREBASE_PROJECT_ID=fyp-erp-system
      - FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fyp-erp-system.iam.gserviceaccount.com
      - FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_FIREBASE_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
        - VITE_FIREBASE_AUTH_DOMAIN=fyp-erp-system.firebaseapp.com
        - VITE_FIREBASE_PROJECT_ID=fyp-erp-system
        - VITE_API_URL=http://localhost:8000
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

### Step 3: Configure GitHub Actions CI/CD Pipeline
*Ramsha populates the workflow files to automate the build check on commits:*

#### [.github/workflows/backend.yml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/.github/workflows/backend.yml)
```yaml
name: Backend CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ develop ]
    paths:
      - 'backend/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Syntax Lint Check
      run: |
        python -m py_compile backend/app/main.py backend/app/routes.py

  dockerize:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Log in to DockerHub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and Push Backend Image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/fyp-backend:latest
          ${{ secrets.DOCKER_USERNAME }}/fyp-backend:${{ github.sha }}
```

#### [.github/workflows/frontend.yml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/.github/workflows/frontend.yml)
```yaml
name: Frontend CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [ develop ]
    paths:
      - 'frontend/**'

jobs:
  build-and-lint:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: |
        cd frontend
        npm ci

    - name: Verify build bundle
      run: |
        cd frontend
        npm run build

  dockerize:
    needs: build-and-lint
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Log in to DockerHub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and Push Frontend Image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        build-args: |
          VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_API_URL=${{ secrets.VITE_API_URL }}
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/fyp-frontend:latest
          ${{ secrets.DOCKER_USERNAME }}/fyp-frontend:${{ github.sha }}
```

### Step 4: Configure GitHub Secrets & Push Workflows
1. Ramsha goes to the GitHub repository web portal **Settings > Secrets and variables > Actions**.
2. Adds repository secrets:
   * `DOCKER_USERNAME`: DockerHub username value.
   * `DOCKER_PASSWORD`: DockerHub login access token.
   * `VITE_FIREBASE_API_KEY`: Firebase web API key.
   * `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain URI.
   * `VITE_FIREBASE_PROJECT_ID`: Firebase project ID value.
   * `VITE_API_URL`: Value set to local minikube Ingress or Render Prod URL.
3. Ramsha commits and pushes the DevOps config files:
```bash
git add .
git commit -m "feat(devops): create Docker configurations and CI/CD pipelines"
git push origin feature/devops/containerization
```
*Ramsha opens a PR `feature/devops/containerization` -> `develop`, reviews it, merges it. This will automatically trigger the GitHub Actions jobs to compile, test, and register the images to DockerHub.*

---

## ☸️ CHECKPOINT 5: LOCAL KUBERNETES & CLOUD DEPLOYMENTS
### 👤 OWNER: Ramsha Naveed (DevOps Lead)

*Ramsha configures Kubernetes configurations and sets up final production clouds.*

### Step 1: Populate Kubernetes Manifests
*Ramsha checks out feature branch `feature/devops/kubernetes-orchestration` and writes the manifests:*
```bash
git checkout develop
git pull origin develop
git checkout -b feature/devops/kubernetes-orchestration
```

#### [k8s/secrets.yaml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/k8s/secrets.yaml)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fyp-secrets
type: Opaque
stringData:
  MONGODB_URI: "mongodb+srv://fyp-user:SafePass123@fyp-erp-cluster.abcde.mongodb.net/fyp-erp-db?retryWrites=true&w=majority"
  FIREBASE_PROJECT_ID: "fyp-erp-system"
  FIREBASE_CLIENT_EMAIL: "firebase-adminsdk-xxxxx@fyp-erp-system.iam.gserviceaccount.com"
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
```

#### [k8s/backend-deployment.yaml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/k8s/backend-deployment.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  labels:
    app: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: docker.io/ramshadevops/fyp-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
        env:
        - name: PORT
          value: "8000"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: fyp-secrets
              key: MONGODB_URI
        - name: FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: fyp-secrets
              key: FIREBASE_PROJECT_ID
        - name: FIREBASE_CLIENT_EMAIL
          valueFrom:
            secretKeyRef:
              name: fyp-secrets
              key: FIREBASE_CLIENT_EMAIL
        - name: FIREBASE_PRIVATE_KEY
          valueFrom:
            secretKeyRef:
              name: fyp-secrets
              key: FIREBASE_PRIVATE_KEY
        livenessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
```

#### [k8s/backend-service.yaml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/k8s/backend-service.yaml)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
  type: ClusterIP
```

#### [k8s/frontend-deployment.yaml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/k8s/frontend-deployment.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  labels:
    app: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: docker.io/ramshadevops/fyp-frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "250m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
```

#### [k8s/frontend-service.yaml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/k8s/frontend-service.yaml)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

#### [k8s/ingress.yaml](file:///c:/Users/User/OneDrive/Desktop/dev%20ops%20project%20mock/k8s/ingress.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fyp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### Step 2: Apply Manifests locally (Minikube)
```bash
minikube start --driver=docker
minikube addons enable ingress

kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

# Push changes to develop
git add .
git commit -m "feat(devops): apply K8s cluster orchestrations configuration"
git push origin feature/devops/kubernetes-orchestration
```
*Ramsha merges the PR on GitHub, promotes code from `develop` to `main`, and pushes to trigger final production deployments.*

### Step 3: Deploy Final Cloud Environments
1. **FastAPI Backend on Render**: Set up a Web Service pointing to `backend/`, choose Docker runtime environment, and add environment variables (`MONGODB_URI`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`). Copy Render URL.
2. **React Frontend on Vercel**: Import repository, configure Vite framework pointing to `frontend/` directory, set environment variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and set `VITE_API_URL` to your Render URL). Run build.

---

## 🎓 CHECKPOINT 6: JOINT SYSTEM VALIDATION & DEMO
### 👤 OWNERS: Entire Team (Ramsha, Khadijah, Sara)

*Once deployments succeed, the team performs the final verification walkthrough scenario.*

### 12-Minute Scenario Walkthrough Actions:
1. **Sara** opens the deployed Vercel URL, registers a student account `sara@uni.edu`, creates a new group named **Alpha**, and submits project topic "AI Grading Engine".
2. **Khadijah** verifies that the group entry is successfully added to the Atlas cloud database by logging into Atlas and checking the `groups` collection.
3. **Ramsha** signs up as a manager `coordinator@uni.edu` and requests customized claims stamp `/api/auth/sync-role`. Logs into the coordinator dashboard, reviews the pending "Alpha" group request, assigns supervisor "Dr. Aamir", and approves the request.
4. **Sara** verifies that the student dashboard status changes to **Approved** and shows the supervisor assignment immediately.
5. **Ramsha** opens terminal, runs `kubectl get pods` to verify Kubernetes replicas are operating without errors.

---

## PHASE 3: ARCHITECTURE DIAGRAMS

### 1. System Integration Flow
```mermaid
graph TD
    A[React Client UI - Sara] -->|1. Authenticate / Login| B[Firebase Authentication]
    A -->|2. Retrieve ID token with Role Claim| B
    A -->|3. Call REST APIs with Bearer Token| C[FastAPI Gateway Server - Khadijah]
    C -->|4. Verify Signature & Custom Claims| B
    C -->|5. Queries / Persists Data| D[MongoDB Atlas Cluster]
```

### 2. ERP Pipeline Workflow Flow
```mermaid
graph LR
    A[Student Group Creation] -->|Pending Status| B[Coordinator View list]
    B -->|Manager approves & input supervisor| C[Approved Status]
    B -->|Manager rejects| D[Rejected Status]
    C -->|Supervisor Name Assigned| E[Student views supervisor allocation details]
```

### 3. CI/CD DevOps Pipeline (Ramsha)
```mermaid
graph LR
    A[Git push / PR develop branch] --> B[GitHub Actions workflows]
    B -->|Lint / Test checks| C[Docker container builds]
    C -->|Push to registry| D[DockerHub Repository]
    D -->|Trigger redeployment| E[Render Web Service]
    D -->|Trigger redeployment| F[Vercel Frontend]
```

---

## PHASE 13: PROJECT DEMO SCRIPT (12-MINUTE TIMELINE)

### 00:00 - 02:00: DevOps Architecture Walkthrough (Ramsha Naveed)
* **Visual**: Show the Git repository structure, local Minikube status (`kubectl get pods`), and the Render web portal panel.
* **Script**: *"Hello everyone. Today we are demonstrating the Final Year Project ERP Portal. I will start by presenting our architecture. We are utilizing a Dockerized React frontend routed to a containerized FastAPI backend. The backend manages state persistence with MongoDB Atlas cloud clusters. Our branching structure features protected main and develop branches. We leverage automated GitHub Actions pipelines to build, test, and release Docker containers directly to DockerHub on push events."*

### 02:00 - 05:00: Student Dashboard Walkthrough & Group Creation (Sara Haider)
* **Visual**: Show Vercel static app landing interface, navigate to login page, fill out student details `sara@uni.edu` / `Pass123`, and click Create Group form. Fill out Topic: "Deep Learning Grading Engine" and members "khadijah@uni.edu, ramsha@uni.edu".
* **Script**: *"I am now accessing the client portal as a student. I will create a new user profile, logging in with Firebase Auth. Notice the student dashboard displays standard pipeline progress indicators, showing 'No Group Registered' yet. I will complete this registration form to submit our topic. Now, our dashboard state displays 'Status: Pending' and the timeline moves to 'Under Review'. I'll hand over to Khadijah to show how the backend processes this database request."*

### 05:00 - 08:00: Backend Code & Custom Claims Verification (Khadijah Zahoor)
* **Visual**: Share FastAPI interactive docs screen (`/docs`). Query GET `/api/groups/my` with student auth headers, showing the record returned with status `pending`. Then show the Manager dashboard login page on the frontend.
* **Script**: *"On the backend side, requests are validated against Firebase JWT tokens. The custom claims role system prevents unauthorized access. When Sara signed up, the server verified her role and synchronized it. If a user attempts to call coordinator actions with a student role, the backend automatically flags it with a 403 Forbidden error. Let's log in as our Coordinator, Ramsha, to approve the group."*

### 08:00 - 11:00: Manager Approval Pipeline (Ramsha Naveed)
* **Visual**: Log into the Coordinator dashboard. View the group requests table. Enter supervisor name "Dr. Aamir" next to Alpha group and click Approve. Show the status update immediately and audit logs list.
* **Script**: *"Now logged in as the Coordinator, I have access to all registered groups. I can view group details, set overall system deadlines, and review pipeline statistics. I will assign 'Dr. Aamir' as supervisor and approve this request. Under the hood, the API writes a structured entry to the audit logs collection. Returning to the student dashboard, we observe the status has updated to 'Approved' with the supervisor assigned."*

### 11:00 - 12:00: DevOps Verification & Monitoring (Ramsha Naveed)
* **Visual**: Open terminal. Run `kubectl logs` and display db performance latencies metric.
* **Script**: *"To verify the orchestration system, I'm displaying the logs for both container replicas. Our DB latency endpoints verify that connections are performing fast. We have succeeded in deploying a fully secure, automated, role-based DevOps orchestration project."*

---

## PHASE 14: GRADING RUBRIC

| Grading Criteria | Execution Requirement | Max Score |
| :--- | :--- | :--- |
| **Auth & Security** | Successful JWT validation, custom claims sync API, CORS configuration, SSL setups | 20 points |
| **Backend Architecture** | Database connectivity models, audit logs records, deadline validations, API test suite | 25 points |
| **Frontend UI/UX** | Responsive React layout matching mockup classes, protected routing flows, charts | 25 points |
| **CI/CD & DevOps** | GitHub Actions build/push jobs, Docker multi-stage containers, Kubernetes manifests | 30 points |
| **Total Marks** | **Fully working production-grade role-based FYP ERP deployment** | **100 points** |
