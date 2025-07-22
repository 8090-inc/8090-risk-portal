const { google } = require('googleapis');
const fs = require('fs');

async function checkAuth() {
  try {
    console.log('Checking Google Drive authentication...');
    
    const credentials = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
    console.log('Service Account Email:', credentials.client_email);
    console.log('Project ID:', credentials.project_id);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    // Test authentication
    const authClient = await auth.getClient();
    console.log('✅ Authentication successful');
    
    const driveService = google.drive({ version: 'v3', auth });
    
    // Try to list ANY files (even if empty)
    console.log('Testing basic Drive API access...');
    const response = await driveService.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)'
    });
    
    console.log(`✅ Drive API access successful - found ${response.data.files.length} files`);
    
    if (response.data.files.length > 0) {
      console.log('Files accessible to service account:');
      response.data.files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.id})`);
      });
    } else {
      console.log('⚠️  No files are currently shared with this service account');
    }
    
    // Try the specific file again
    console.log('\nTesting access to specific file...');
    try {
      const fileResponse = await driveService.files.get({
        fileId: '1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm',
        fields: 'id, name, mimeType'
      });
      console.log('✅ SUCCESS! File found:', fileResponse.data.name);
    } catch (error) {
      console.log('❌ File access failed:', error.message);
      console.log('\n🔍 TROUBLESHOOTING STEPS:');
      console.log('1. Make sure you shared the file with: 290017403746-compute@developer.gserviceaccount.com');
      console.log('2. Give it "Editor" permissions');
      console.log('3. Wait 1-2 minutes for permissions to propagate');
      console.log('4. Make sure the file owner allows external sharing');
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

checkAuth();
