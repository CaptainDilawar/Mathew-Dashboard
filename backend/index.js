const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const express = require('express');
const cors = require('cors');

// If modifying these scopes, delete token.json and re-authorize the app.
const SCOPES = [
  // Sheets
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  // Drive (full, file-scoped, readonly and metadata)
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.appdata'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

const app = express();
app.use(cors());
const port = 3001;

app.get('/api/spreadsheets', async (req, res) => {
  try {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)',
    });
    res.json(response.data.files);
  } catch (error) {
    console.error('The Drive API returned an error: ' + error);
    res.status(500).send('Error fetching spreadsheets from Google Drive');
  }
});

app.get('/api/sheets/:sheetId/metadata', async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = req.params.sheetId;
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetNames = response.data.sheets.map(s => s.properties.title);
    res.json(sheetNames);
  } catch (error) {
    console.error('The Sheets API returned an error: ' + error);
    res.status(500).send('Error fetching sheet metadata');
  }
});

app.get('/api/sheets/:sheetId', async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = req.params.sheetId;
    const range = req.query.range || 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    res.json(response.data.values || []);
  } catch (error) {
    console.error('The API returned an error: ' + error);
    res.status(500).send('Error fetching data from Google Sheets');
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log('\nIMPORTANT: Please place your "credentials.json" file in the "backend" directory.');
  console.log('If you run this for the first time, you will be prompted to authorize this application.');
  console.log('A browser window will open. Please log in with your Google account and grant access.');
  console.log('After authorization, you will be redirected to a page that says "Authentication successful!".');
  console.log('You can then close that page and the server will be ready.\n');
});
