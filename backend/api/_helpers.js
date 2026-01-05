const { google } = require('googleapis');

// Scopes used by the app
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.appdata'
];

function loadSavedCredentialsIfExist() {
  const tokenJson = process.env.GOOGLE_TOKEN;
  if (!tokenJson) return null;
  try {
    const parsed = JSON.parse(tokenJson);
    const client = new google.auth.OAuth2(parsed.client_id || parsed.clientId, parsed.client_secret || parsed.clientSecret);
    client.setCredentials(parsed);
    return client;
  } catch (e) {
    return null;
  }
}

function saveCredentialsHint(client) {
  // We cannot persist credentials to disk on serverless. Print instructions for operator to create env var.
  const payload = {
    type: 'authorized_user',
    client_id: client._clientId || process.env.GOOGLE_CLIENT_ID || null,
    client_secret: client._clientSecret || process.env.GOOGLE_CLIENT_SECRET || null,
    refresh_token: client.credentials && client.credentials.refresh_token
  };
  console.log('\n--- GOOGLE_TOKEN hint (use this JSON to set the GOOGLE_TOKEN env var) ---');
  console.log(JSON.stringify(payload));
  console.log('--- End ---\n');
}

async function authorize() {
  let client = loadSavedCredentialsIfExist();
  if (client) return client;

  const credsJson = process.env.GOOGLE_CREDENTIALS;
  if (!credsJson) {
    throw new Error('Missing GOOGLE_CREDENTIALS environment variable. Set it to the contents of your credentials.json (client_id & client_secret).');
  }

  const keys = JSON.parse(credsJson);
  const key = keys.installed || keys.web;
  const oAuth2Client = new google.auth.OAuth2(key.client_id, key.client_secret, process.env.GOOGLE_REDIRECT_URI || '');

  if (process.env.GOOGLE_TOKEN) {
    try {
      const tokens = JSON.parse(process.env.GOOGLE_TOKEN);
      oAuth2Client.setCredentials(tokens);
      return oAuth2Client;
    } catch (e) {
      throw new Error('GOOGLE_TOKEN is invalid JSON.');
    }
  }

  // If we reach here there's no token available for serverless runtime
  throw new Error('No Google refresh token found. Generate a refresh token locally and set it as the GOOGLE_TOKEN environment variable (see project README).');
}

module.exports = { authorize, SCOPES, saveCredentialsHint };
