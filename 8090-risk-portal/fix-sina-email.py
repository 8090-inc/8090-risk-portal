#!/usr/bin/env python3
import subprocess
import urllib.request
import urllib.error
import json

# Configuration
PROJECT_ID = "dompe-dev-439304"
TENANT_ID = "dompe8090-bf0qr"
SINA_USER_ID = "Tlo3aMTfHfglfRr5AvA1hTBwrl13"

def get_access_token():
    """Get access token using gcloud"""
    result = subprocess.run(['gcloud', 'auth', 'print-access-token'], 
                          capture_output=True, text=True)
    return result.stdout.strip()

def delete_user(user_id, access_token):
    """Delete a user from the Identity Platform tenant"""
    url = f"https://identitytoolkit.googleapis.com/v1/projects/{PROJECT_ID}/tenants/{TENANT_ID}/accounts:delete"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "x-goog-user-project": PROJECT_ID
    }
    
    data = {
        "localId": user_id
    }
    
    req = urllib.request.Request(url, 
                                data=json.dumps(data).encode('utf-8'),
                                headers=headers,
                                method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"✓ Successfully deleted old user")
            return True
    except urllib.error.HTTPError as e:
        error_data = json.loads(e.read().decode('utf-8'))
        print(f"✗ Error deleting user: {error_data}")
        return False

def create_user(email, password, display_name, access_token):
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
    
    req = urllib.request.Request(url, 
                                data=json.dumps(data).encode('utf-8'),
                                headers=headers,
                                method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            user_data = json.loads(response.read().decode('utf-8'))
            print(f"✓ Successfully created user: {email} (UID: {user_data.get('localId', 'N/A')})")
            return True
    except urllib.error.HTTPError as e:
        error_data = json.loads(e.read().decode('utf-8'))
        print(f"✗ Error creating user: {error_data}")
        return False

def main():
    """Main function to fix Sina's email"""
    print(f"Fixing Sina Sojoodi's email domain")
    print(f"Old: sina.sojoodi@dompe.com")
    print(f"New: sina.sojoodi@ext.dompe.com\n")
    
    # Get access token
    access_token = get_access_token()
    
    # Step 1: Delete the old user
    print("Step 1: Deleting old user...")
    if not delete_user(SINA_USER_ID, access_token):
        print("Failed to delete old user. Aborting.")
        return
    
    # Step 2: Create new user with correct email
    print("\nStep 2: Creating new user with correct email...")
    if create_user("sina.sojoodi@ext.dompe.com", "sojoodi", "Sina Sojoodi", access_token):
        print("\n✅ Successfully updated Sina Sojoodi's email to @ext.dompe.com!")
    else:
        print("\n❌ Failed to create new user.")

if __name__ == "__main__":
    main()