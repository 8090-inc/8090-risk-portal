const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

// Initialize Firebase Admin SDK
// You'll need to create a service account key from the Firebase Console
// and set the path to it in the GOOGLE_APPLICATION_CREDENTIALS environment variable
const app = initializeApp({
  projectId: 'dompe-dev-439304',
});

const auth = getAuth(app);

// Tenant ID
const TENANT_ID = 'dompe8090-bf0qr';

async function importUsers() {
  try {
    // Read users from JSON file
    const usersData = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    const users = usersData.users;

    // Get tenant auth instance
    const tenantAuth = auth.tenantManager().authForTenant(TENANT_ID);

    // Import users
    for (const user of users) {
      try {
        const userRecord = await tenantAuth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        });
        console.log(`Successfully created user: ${userRecord.email} (UID: ${userRecord.uid})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`User ${user.email} already exists, skipping...`);
        } else {
          console.error(`Error creating user ${user.email}:`, error.message);
        }
      }
    }

    console.log('\nUser import completed!');
  } catch (error) {
    console.error('Error importing users:', error);
  }
}

// Run the import
importUsers();