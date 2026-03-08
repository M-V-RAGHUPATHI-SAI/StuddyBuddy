import os
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

import json

# Initialize Firebase Admin
firebase_json = os.getenv("FIREBASE_JSON")
if firebase_json:
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
else:
    cred_path = 'serviceAccount.json'
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("WARNING: Cannot find Firebase configuration. Authentication will fail.")

def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
            
        token = auth_header.split(' ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token  # attach user info
        except Exception as e:
            print(f"Token verification failed: {e}")
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(*args, **kwargs)
    return decorated_function
