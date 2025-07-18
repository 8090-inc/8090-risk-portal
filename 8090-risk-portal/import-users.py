#!/usr/bin/env python3
import json
import subprocess
import requests

# Configuration
PROJECT_ID = "dompe-dev-439304"
TENANT_ID = "dompe8090-bf0qr"

def get_access_token():
    """Get access token using gcloud"""
    result = subprocess.run(['gcloud', 'auth', 'print-access-token'], 
                          capture_output=True, text=True)
    return result.stdout.strip()

def create_user_in_tenant(email, password, display_name, access_token):
    """Create a user in the Identity Platform tenant"""
    url = f"https://identitytoolkit.googleapis.com/v1/projects/{PROJECT_ID}/tenants/{TENANT_ID}/accounts"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "x-goog-user-project": PROJECT_ID
    }
    
    data = {
        "email": email,
        "password": password,
        "displayName": display_name,
        "emailVerified": True
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✓ Successfully created user: {email} (UID: {user_data.get('localId', 'N/A')})")
    else:
        error_data = response.json()
        if 'error' in error_data and error_data['error'].get('message') == 'EMAIL_EXISTS':
            print(f"ℹ User {email} already exists, skipping...")
        else:
            print(f"✗ Error creating user {email}: {error_data}")

def main():
    """Main function to import users"""
    # Get access token
    access_token = get_access_token()
    
    # Read users from JSON
    with open('users.json', 'r') as f:
        users_data = json.load(f)
    
    print(f"Importing users to tenant: {TENANT_ID}\n")
    
    # Create each user
    for user in users_data['users']:
        create_user_in_tenant(
            email=user['email'],
            password=user['password'],
            display_name=user['displayName'],
            access_token=access_token
        )
    
    print("\nUser import completed!")

if __name__ == "__main__":
    main()