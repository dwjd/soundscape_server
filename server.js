var app = require('express').createServer();
var request = require('request');

app.get('/where', function(req, res) {
  sys.puts(navigator.geolocation)
}

// what venue is this?
app.get('/venue', function(req, res) {
  var location = navigator.geolocation
  sys.puts(location)
  request({uri:'https://api.foursquare.com/v2/venues/search?client_id=JAQQS11NSBCQEP3RBZAVITCME54S3FSCWAZ1204KS1TMNRJY&client_secret=CLTMSOONEQ2HY4Y55RGJFUAWDRTQ5TIJ0XTIR3T4ZFL0STPF&ll='}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      sys.puts(body) // Print the google web page.
    }
  })
  // get list of venues from foursquare
  // sort by our venue database by number of tags
  // return sorted list
  res.send('user' + req.params.id);
});

// get song
//  fake data  
// get /[venues]
// put / tag (song, user, venue)
