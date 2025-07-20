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
      signInSuccess: (user, credential, redirectUrl) => {
        // Return true to continue the redirect automatically
        return true;
      },
      completeSignOut: () => {
        // Sign out from Firebase Auth
        return firebase.auth().signOut().then(() => {
          document.getElementById('firebaseui-auth-container').innerHTML = 
            '<div style="text-align: center; padding: 20px;">' +
            '<h3>You have been signed out</h3>' +
            '<p><a href="/">Return to application</a></p>' +
            '</div>';
        }).catch((error) => {
          document.getElementById('firebaseui-auth-container').innerHTML = 
            '<div style="text-align: center; padding: 20px;">' +
            '<h3>Error during signout</h3>' +
            '<pre>' + JSON.stringify(error, null, 2) + '</pre>' +
            '</div>';
        });
      }
    }
  }
};

// Initialize FirebaseUiHandler
const handler = new firebaseui.auth.FirebaseUiHandler(
  '#firebaseui-auth-container', 
  configs
);

// Create Authentication instance and start
const ciapInstance = new ciap.Authentication(handler);
ciapInstance.start();