#!/usr/bin/env python3
import subprocess
import urllib.request
import urllib.error
import json

# Configuration
PROJECT_ID = "dompe-dev-439304"
TENANT_ID = "dompe8090-bf0qr"
USER_ID = "CxBVxNz97xdzGsIssFzPgVzsta82"  # The erroneous user to delete

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
            print(f"✓ Successfully deleted user with ID: {user_id}")
            return True
    except urllib.error.HTTPError as e:
        error_data = json.loads(e.read().decode('utf-8'))
        print(f"✗ Error deleting user: {error_data}")
        return False

def main():
    """Main function to delete the erroneous user"""
    print(f"Deleting erroneous user entry from tenant: {TENANT_ID}")
    print(f"User ID: {USER_ID}")
    print(f"Email: rohit.kelapure@dompe.ext.com (typo)\n")
    
    # Get access token
    access_token = get_access_token()
    
    # Delete the user
    if delete_user(USER_ID, access_token):
        print("\nUser successfully deleted!")
    else:
        print("\nFailed to delete user.")

if __name__ == "__main__":
    main()