var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var db = require('../models');
var path = require('path');
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var jsonPath = path.join(__dirname, '../assets/client_secret.json');

const authenticate = (req, res, next) => {
  // Load client secrets from a local file.
  const { programId } = req.params;
  if (!programId) {
    console.log('No Program Id specified');
    res.status(400).send('No Program ID');
    return;
  }
  fs.readFile(jsonPath, function processClientSecrets(err, data) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      res.status(400).send('Unauthorized.');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Drive API.
    var content = JSON.parse(data);
    authorize(content[programId.toString()], sendAuth);
  });
  

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    db.googleCredential.findOne({where: {programId: programId}})
    .then((result) => {
      if(!result) {
        res.status(400).send('Invalid Token');
        return;
      }
      var content = {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: result.access_type,
        expiry_date: result.expiry_date
      };
      oauth2Client.credentials = content;
      callback(oauth2Client);
    })
  }

  function sendAuth(auth) {
    req.googleAuth = auth;
    next();
  }
};

module.exports = authenticate;
