// Firebase configuration for dompe-dev-439304
const firebaseConfig = {
  apiKey: "AIzaSyC4EUspTmYLmd468f9819cCHjo85pcu4_I",
  authDomain: "dompe-dev-439304.firebaseapp.com",
  projectId: "dompe-dev-439304",
  storageBucket: "dompe-dev-439304.appspot.com",
  messagingSenderId: "290017403746",
  appId: "1:290017403746:web:8090riskportal"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the authentication instance for the tenant
const auth = firebase.auth();
auth.tenantId = 'dompe8090-bf0qr'; // Your Identity Platform tenant ID

// Initialize the FirebaseUI Widget
const ui = new firebaseui.auth.AuthUI(auth);

// Get URL parameters to handle IAP redirect
const urlParams = new URLSearchParams(window.location.search);
const redirectUri = urlParams.get('redirect_uri') || 'https://34.102.196.90';
const state = urlParams.get('state');

// FirebaseUI configuration
const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: async function(authResult, redirectUrl) {
      // User successfully signed in
      // If IAP redirect_uri is present, use it
      if (urlParams.get('redirect_uri') && state) {
        try {
          // Get the ID token from the authenticated user
          const idToken = await authResult.user.getIdToken();
          
          // Show loading message
          document.getElementById('firebaseui-auth-container').innerHTML = 
            '<div style="text-align: center; margin-top: 20px;">' +
            '<div style="color: #4285f4; font-weight: bold;">Redirecting to application...</div>' +
            '<div style="margin-top: 10px; color: #666;">Please wait while we complete your sign-in.</div>' +
            '</div>';
          
          // Use proper form POST to IAP callback endpoint
          console.log('Creating form POST to IAP callback:', redirectUri);
          
          // Create form element
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = redirectUri;
          form.enctype = 'application/x-www-form-urlencoded';
          
          // Add state parameter (required)
          const stateField = document.createElement('input');
          stateField.type = 'hidden';
          stateField.name = 'state';
          stateField.value = state;
          form.appendChild(stateField);
          
          // Add ID token (try different parameter names)
          const tokenField = document.createElement('input');
          tokenField.type = 'hidden';
          tokenField.name = 'id_token';
          tokenField.value = idToken;
          form.appendChild(tokenField);
          
          // Also try with 'code' parameter name
          const codeField = document.createElement('input');
          codeField.type = 'hidden';
          codeField.name = 'code';
          codeField.value = idToken;
          form.appendChild(codeField);
          
          // Submit form
          document.body.appendChild(form);
          console.log('Submitting form to IAP callback');
          form.submit();
          
          return false; // Prevent FirebaseUI redirect
        } catch (error) {
          console.error('Error getting ID token:', error);
          // Show error message to user
          document.getElementById('firebaseui-auth-container').innerHTML = 
            '<div style="color: red; text-align: center; margin-top: 20px;">' +
            'Authentication failed. Please try again.</div>' +
            '<div style="text-align: center; margin-top: 10px;">' +
            '<button onclick="window.location.reload()">Retry</button></div>';
          return false;
        }
      }
      // Otherwise use default redirect
      return true;
    },
    uiShown: function() {
      // The widget is rendered, hide the loader
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Where to redirect after successful sign-in (fallback)
  signInSuccessUrl: redirectUri,
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
      signInMethod: 'password'
    }
  ],
  // Terms of service url
  tosUrl: '#',
  // Privacy policy url
  privacyPolicyUrl: '#',
  // Other config options
  signInFlow: 'popup',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};

// Start the FirebaseUI widget
ui.start('#firebaseui-auth-container', uiConfig);

// Log tenant configuration for debugging
console.log('Configured for tenant:', auth.tenantId);
console.log('Redirect URL:', uiConfig.signInSuccessUrl);
console.log('IAP redirect_uri:', urlParams.get('redirect_uri'));
console.log('IAP state:', state);
console.log('Mode:', urlParams.get('mode'));