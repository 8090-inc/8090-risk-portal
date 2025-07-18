#!/usr/bin/env python3
import json
import subprocess
import urllib.request
import urllib.error

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
    # Ensure password is at least 6 characters
    if len(password) < 6:
        password = password + "2024"
    
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
            return "success"
    except urllib.error.HTTPError as e:
        error_data = json.loads(e.read().decode('utf-8'))
        if 'error' in error_data and error_data['error'].get('message') == 'EMAIL_EXISTS':
            print(f"ℹ User {email} already exists, skipping...")
            return "exists"
        else:
            print(f"✗ Error creating user {email}: {error_data}")
            return "failed"

def main():
    """Main function to import users"""
    # Get access token
    access_token = get_access_token()
    
    # Read users from JSON
    with open('users-new-batch.json', 'r') as f:
        users_data = json.load(f)
    
    total_users = len(users_data['users'])
    print(f"Importing {total_users} users to tenant: {TENANT_ID}")
    print("Note: Passwords shorter than 6 characters will have '2024' appended\n")
    
    # Track results
    successful = 0
    already_exists = 0
    failed = 0
    failed_users = []
    
    # Create each user
    for i, user in enumerate(users_data['users'], 1):
        print(f"[{i}/{total_users}] Processing {user['email']}...")
        
        result = create_user_in_tenant(
            email=user['email'],
            password=user['password'],
            display_name=user['displayName'],
            access_token=access_token
        )
        
        if result == "success":
            successful += 1
        elif result == "exists":
            already_exists += 1
        else:
            failed += 1
            failed_users.append(user['email'])
    
    print("\n" + "="*50)
    print("User import completed!")
    print(f"Total users processed: {total_users}")
    print(f"✓ Successfully created: {successful}")
    print(f"ℹ Already existed: {already_exists}")
    print(f"✗ Failed: {failed}")
    
    if failed_users:
        print("\nFailed users:")
        for email in failed_users:
            print(f"  - {email}")

if __name__ == "__main__":
    main()