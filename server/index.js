const express = require('express')
const request = require('request');
const dotenv = require('dotenv');

const port = 5001

global.access_token = ''
global.refresh_token = ''
global.token_expiry = 0

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify_redirect_uri = 'http://localhost:3000/auth/callback'

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var app = express();

app.get('/auth/login', (req, res) => {

  var scope = "streaming user-read-email user-read-private user-modify-playback-state"
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req, res) => {

  var code = req.query.code;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      refresh_token = body.refresh_token;
      // token_expiry = Date.now() + body.expires_in * 1000; debug!
      token_expiry = Date.now() + 5000;
      res.redirect('/')
    }
  });

})

app.get('/auth/token', (req, res) => {
  if (Date.now() > token_expiry && token_expiry !== 0) {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'))
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
    request.post(authOptions, (error, response, body) => {
      console.log(body); // debug only
      if (!error && response.statusCode === 200) {
          access_token = body.access_token;
          if (body.refresh_token) {
              refresh_token = body.refresh_token;
          }
          token_expiry = Date.now() + body.expires_in * 1000;
          res.json({ access_token: access_token });
      } 
      else {
          res.status(500).json({ error: 'Failed to refresh token' });
      }
    });
  }
  else {
    res.json({ access_token: access_token });
  }
  });

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
