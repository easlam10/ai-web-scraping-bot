const { Dropbox } = require('dropbox');
const fs = require('fs');
const path = require('path');
const config = require('../config/keys');

// Initialize with full permissions
const dbx = new Dropbox({
  accessToken: config.dropbox.accessToken
});

async function uploadFile(filePath) {
  try {
    // Validate file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath);
    const originalExt = path.extname(filePath); // Keeps .xlsx or .jpg
    const fileName = `nust_admissions_${Date.now()}${originalExt}`;

    // Upload with explicit permissions
    const response = await dbx.filesUpload({
      path: `/${fileName}`,
      contents: fileContent,
      mode: { '.tag': 'overwrite' },
      autorename: false,
      strict_conflict: true
    });

    // Create shareable link
    const link = await dbx.sharingCreateSharedLinkWithSettings({
      path: response.result.path_display,
      settings: {
        requested_visibility: 'public',
        audience: 'public',
        access: 'viewer'
      }
    });

    return link.result.url.replace('dl=0', 'raw=1');
  } catch (error) {
    console.error('❌ Detailed Dropbox error:', {
      status: error.status,
      headers: error.headers,
      error: error.error,
      stack: error.stack
    });
    throw new Error('Failed to upload file. Please verify app permissions and token.');
  }
}

module.exports = uploadFile;