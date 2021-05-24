const { google } = require('googleapis');
const fs = require('fs');
const { file } = require('googleapis/build/src/apis/file');


const TOKEN_PATH = "credentials.json"

//make the authentication and run the needed
function uploadDemos(filename, mimetype, filePath) {
  fs.readFile(TOKEN_PATH, (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    JSONKEYS = JSON.parse(content);
    
    /*
        initialize secret credentials ?
        
        let CLIENT_ID = null;
        let CLIENT_SECRET = null;
        let REDIRECT_URI = null;
        let REFRESH_TOKEN = null;
        */

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID = JSONKEYS.installed.client_id,
      CLIENT_SECRET = JSONKEYS.installed.client_secret,
      REDIRECT_URI = JSONKEYS.installed.redirect_uris
    );

    oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN = JSONKEYS.installed.refresh_token
    })

    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    })

    
    

    //should upload demos on this call 
    uploadFile(drive, filename, mimetype, filePath);

    //save the date when the last upload has been done

    try {
      fs.writeFile('lastuploaddemodate.txt', Date().toLocaleString(), 'utf8', (err, result) => {
        if (err) return console.log("Error writing file", err);
        console.log(result);
      })

    } catch (error) {
      console.log(error);
    }

  })
}



/*
async function listFiles(drive) {

  try {

    const params = { pageSize: 3 };
    const response = await drive.files.list(params);

    console.log(response.data);

  } catch (error) {
    console.log(error.message);
  }
}
*/

async function uploadFile(drive, filename, mimetype, filePath) {
  try {

    const response = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: mimetype
      },
      media: {
        mimeType: mimetype,
        body: fs.createReadStream(filePath)
      }
    })

    console.log(response.data);

  } catch (error) {
    console.log(error.message)
  }
}
/*
async function deleteFile(drive){
  try{

    const response = await drive.files.delete({
      fileId: '1jtX9XT2FW7Ch8czCw-94vDYCTh0FOhpw'
    })

    console.log(response.data, response.status);

  }catch(error){
  console.log(error.message)
  }

}

deleteFile();

*/
/*

async function generatePublicURL(drive) {

  try {

    const fileId = '1wpVqhXyiiJ5z_p4PAQaXjWnW_z2YNIX2';
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    const result = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink'
    })

    console.log(result.data);


  } catch (error) {
    console.log(error.message)
  }
}*/


//generatePublicURL();

module.exports = { uploadDemos }