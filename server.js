var foursquare = require("node-foursquare").Foursquare();
var app = require('express').createServer();
var foursquare_token = '';

CLIENT_ID = 'JAQQS11NSBCQEP3RBZAVITCME54S3FSCWAZ1204KS1TMNRJY'
CLIENT_SECRET = 'CLTMSOONEQ2HY4Y55RGJFUAWDRTQ5TIJ0XTIR3T4ZFL0STPF'
YOUR_REDIRECT = 'soundscape.com/auth/foursquare'

app.get('/login', function(req, res) {
  var url = Foursquare.getAuthClientRedirectUrl([CLIENT_ID], [YOUR_REDIRECT]);
  res.writeHead(303, { "location": url });
  res.end();
});

app.get('/callback', function (req, res) {
  var code = req.query.code;

  Foursquare.getAccessToken({
    code: code,
    redirect_uri: [YOUR_REDIRECT],
    client_id: [CLIENT_ID],
    client_secret: [CLIENT_SECRET]
  }, function (error, accessToken) {
    if(error) {
      res.send("An error was thrown: " + error.message);
    }
    else {
      // Save the accessToken and redirect.
      foursquare_token = accessToken
      // call /venue with latitude and longitude ...
      res.writeHead(303, { "location": '/venue' })
    }
  });
});


// what venue is this?
app.get('/venue', function(req, res) {
  // get list of venues from foursquare
  // sort by our venue database by number of tags
  // return sorted list
  res.send('user' + req.params.id);
});

get song
  fake data  
get /[venues]
put / tag (song, user, venue)
