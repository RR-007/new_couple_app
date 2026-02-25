import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# We need to initialize the Firebase Admin SDK.
# In production (Render), we will pass the service account JSON as an environment variable or secret file.
# Since it's a JSON string, we can parse it from an env var called FIREBASE_SERVICE_ACCOUNT_KEY

def initialize_firebase():
    if not firebase_admin._apps:
        service_account_info = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
        if service_account_info:
            try:
                cred_dict = json.loads(service_account_info)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized via JSON env var.")
            except Exception as e:
                print(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: {e}")
        else:
            # Fallback to local file for development if the env var isn't set
            local_key_path = "serviceAccountKey.json"
            if os.path.exists(local_key_path):
                cred = credentials.Certificate(local_key_path)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized via local serviceAccountKey.json.")
            else:
                print("WARNING: No Firebase credentials found! Cannot connect to Firestore.")

initialize_firebase()

def get_db():
    try:
        return firestore.client()
    except Exception as e:
        print(f"Error getting Firestore client: {e}")
        return None
