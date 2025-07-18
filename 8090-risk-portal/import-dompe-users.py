#!/usr/bin/env python3
"""Import users with @dompe.com domain to Identity Platform tenant"""

import json
import subprocess
import sys

def import_users():
    # Read users from file
    with open('users-dompe.json', 'r') as f:
        data = json.load(f)
    
    users = data['users']
    tenant_id = 'dompe8090-bf0qr'
    project_id = 'dompe-dev-439304'
    
    print(f"Importing {len(users)} users to tenant {tenant_id}...")
    
    # Create temp file with user data in the format expected by gcloud
    import_data = {"users": []}
    
    for user in users:
        import_user = {
            "localId": user['email'].split('@')[0].replace('.', ''),  # Generate a unique ID
            "email": user['email'],
            "emailVerified": user.get('emailVerified', True),
            "displayName": user.get('displayName', ''),
            "rawPassword": user['password']
        }
        import_data['users'].append(import_user)
    
    # Write to temp file
    with open('/tmp/users-import.json', 'w') as f:
        json.dump(import_data, f, indent=2)
    
    # Import users using gcloud
    cmd = [
        'gcloud', 'identity-platform', 'tenants', 'users', 'import',
        '/tmp/users-import.json',
        f'--tenant={tenant_id}',
        f'--project={project_id}',
        '--hash-algo=STANDARD_SCRYPT',
        '--format=json'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Successfully imported users!")
        
        # Parse the result to show imported user details
        if result.stdout:
            imported_users = json.loads(result.stdout)
            if 'users' in imported_users:
                print("\nImported users:")
                for u in imported_users['users']:
                    print(f"  - {u.get('email', 'N/A')} (ID: {u.get('localId', 'N/A')})")
        
    except subprocess.CalledProcessError as e:
        print(f"Error importing users: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    import_users()