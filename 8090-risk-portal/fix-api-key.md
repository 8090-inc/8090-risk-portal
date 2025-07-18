# Fix API Key Restrictions

The error "requests-to-this-api-securetoken.googleapis.com-method-google.identity.securetoken.v1.securetoken.granttoken-are-blocked" indicates that your API key restrictions are blocking the SecureToken API, which is required for Firebase Authentication.

## Steps to Fix:

1. Go to the Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=dompe-dev-439304

2. Find your API key: `AIzaSyC4EUspTmYLmd468f9819cCHjo85pcu4_I`

3. Click on the API key to edit it

4. In the "API restrictions" section, you need to add BOTH APIs:
   - **Identity Toolkit API** (identitytoolkit.googleapis.com)
   - **Token Service API** (securetoken.googleapis.com)

5. If you have "Restrict key" selected, make sure BOTH APIs are in the list. Currently, you likely only have Identity Toolkit API.

6. Click "Add an API" and search for "Token Service API" or "securetoken.googleapis.com"

7. Add it to the list of allowed APIs

8. Save the changes

9. Wait 1-2 minutes for the changes to propagate

## Alternative: Temporarily Remove API Restrictions

If the above doesn't work immediately:

1. Temporarily set the API restrictions to "Don't restrict key"
2. Save and test
3. Once working, you can add back the restrictions with both APIs

## Verification

After making the changes, the authentication flow should proceed without the "grantToken-are-blocked" error.