import os
import logging
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK using environment variables
firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
firebase_client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
firebase_private_key = os.getenv("FIREBASE_PRIVATE_KEY")

if firebase_project_id and firebase_client_email and firebase_private_key:
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
    logger.warning("Firebase env variables not set. Auth verification will fail.")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "role": decoded_token.get("role", "student")
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