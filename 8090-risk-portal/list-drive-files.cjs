const { google } = require('googleapis');
const fs = require('fs');

async function listDriveFiles() {
  try {
    console.log('Listing files accessible to service account...');
    
    const credentials = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const driveService = google.drive({ version: 'v3', auth });
    
    // List files
    const response = await driveService.files.list({
      pageSize: 20,
      fields: 'files(id, name, mimeType, owners)',
      q: "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='application/vnd.google-apps.spreadsheet'"
    });
    
    const files = response.data.files;
    console.log(`Found ${files.length} spreadsheet files:`);
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Type: ${file.mimeType}`);
      console.log(`   Owners: ${file.owners?.map(o => o.emailAddress).join(', ')}`);
      console.log('');
    });

    // Also try to search for files with "risk" in the name
    console.log('Searching for files with "risk" in name...');
    const riskSearch = await driveService.files.list({
      pageSize: 20,
      fields: 'files(id, name, mimeType)',
      q: "name contains 'risk'"
    });
    
    console.log(`Found ${riskSearch.data.files.length} files with "risk" in name:`);
    riskSearch.data.files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (ID: ${file.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listDriveFiles();
