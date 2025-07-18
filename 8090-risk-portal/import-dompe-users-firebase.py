#!/usr/bin/env python3
"""Import users with @dompe.com domain to Identity Platform tenant using Firebase Admin SDK"""

import json
import requests
import sys

def import_users():
    # Read users from file
    with open('users-dompe.json', 'r') as f:
        data = json.load(f)
    
    users = data['users']
    tenant_id = 'dompe8090-bf0qr'
    project_id = 'dompe-dev-439304'
    
    print(f"Importing {len(users)} users to tenant {tenant_id}...")
    
    # Get access token
    import subprocess
    result = subprocess.run(['gcloud', 'auth', 'print-access-token'], 
                          capture_output=True, text=True, check=True)
    access_token = result.stdout.strip()
    
    # Identity Platform REST API endpoint
    base_url = f"https://identitytoolkit.googleapis.com/v1/projects/{project_id}/tenants/{tenant_id}"
    
    # Import users one by one
    success_count = 0
    for user in users:
        # Create user via REST API
        url = f"{base_url}/accounts"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        user_data = {
            'email': user['email'],
            'password': user['password'],
            'displayName': user.get('displayName', ''),
            'emailVerified': user.get('emailVerified', True),
            'disabled': False
        }
        
        try:
            response = requests.post(url, headers=headers, json=user_data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✓ Created user: {user['email']} (ID: {result.get('localId', 'N/A')})")
                success_count += 1
            elif response.status_code == 400 and 'EMAIL_EXISTS' in response.text:
                print(f"⚠ User already exists: {user['email']}")
                success_count += 1
            else:
                print(f"✗ Failed to create user: {user['email']}")
                print(f"  Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"✗ Error creating user {user['email']}: {e}")
    
    print(f"\nSummary: {success_count}/{len(users)} users imported successfully")

if __name__ == "__main__":
    import_users()