// Import firebase modules.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// Import firebaseui module.
import * as firebaseui from 'firebaseui'
// Import gcip-iap module.
import * as ciap from 'gcip-iap';

// Configuration for FirebaseUiHandler
// The configuration key is the API key of the project
const configs = {
  'AIzaSyC4EUspTmYLmd468f9819cCHjo85pcu4_I': {
    authDomain: 'dompe-dev-439304.firebaseapp.com',
    // For single tenant, we'll use optionFirst mode
    displayMode: 'optionFirst',
    // Define tenants
    tenants: {
      'dompe8090-bf0qr': {
        displayName: 'Dompé Risk Portal',
        signInOptions: [
          {
            provider: 'password',
            requireDisplayName: false
          }
        ]
      }
    },
    // Optional callbacks
    callbacks: {
      signInUiShown: (tenantId) => {
        console.log(`Sign-in UI shown for tenant: ${tenantId}`);
      },
      signInSuccess: (user, credential, redirectUrl) => {
        console.log('Sign-in successful for user:', user.email);
        // Return true to continue the redirect automatically
        return true;
      },
      uiShown: () => {
        console.log('FirebaseUI widget rendered');
      },
      completeSignOut: () => {
        console.log('Signing out user...');
        // Sign out from Firebase Auth
        return firebase.auth().signOut().then(() => {
          console.log('User signed out successfully');
          // Show a message to the user
          document.getElementById('firebaseui-auth-container').innerHTML = 
            '<div style="text-align: center; padding: 20px;">' +
            '<h3>You have been signed out</h3>' +
            '<p>You can close this window or <a href="/">return to the application</a></p>' +
            '</div>';
        });
      }
    }
  }
};

// Initialize FirebaseUiHandler
console.log('Initializing FirebaseUiHandler...');
const handler = new firebaseui.auth.FirebaseUiHandler(
  '#firebaseui-auth-container', 
  configs
);

// Create Authentication instance and start
console.log('Starting authentication flow...');
const ciapInstance = new ciap.Authentication(handler);
ciapInstance.start().then(() => {
  console.log('Authentication flow started successfully');
}).catch((error) => {
  console.error('Failed to start authentication flow:', error);
});