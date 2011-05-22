var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types"), useTimestamps = mongooseTypes.useTimestamps;
var Email = mongoose.SchemaTypes.Email;
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var underscore = require('underscore');

// is there a song reference id we can get easily from echophone?
var Song = new Schema({
    artist      : String
  , title       : String
  , album       : String
  , echonest_id : ObjectId // echonest
}); 
mongoose.model('Song', Song);

var Person = new Schema({
    name  : String
  , email : [Email] 
  , phone : { type: Number, min: 1000000000, max: 99999999999 }
});
mongoose.model('Person', Person);

var Tags = new Schema({
    user_id  : ObjectId // mongo
  , song_id  : ObjectId // mongo
  , venue_id : ObjectId // foursquare
  , lat      : { type: Number, min: -90, max: 90 }
  , lon      : { type: Number, min: -90, max: 90 }
  , date     : Date
  , like     : Boolean
}); 
mongoose.model('Tags', Tags);

var app = require('express').createServer();
var request = require('request');
var sys = require('sys');
var foursquare_id = 'JAQQS11NSBCQEP3RBZAVITCME54S3FSCWAZ1204KS1TMNRJY';
var foursquare_secret = 'CLTMSOONEQ2HY4Y55RGJFUAWDRTQ5TIJ0XTIR3T4ZFL0STPF';

var db = mongoose.connect('mongodb://localhost/soundscape');

// get a list of the most likely venues
app.get('/venue/:ll', function(req, res) {
  request({uri:'https://api.foursquare.com/v2/venues/search?client_id='+foursquare_id+'&client_secret='+foursquare_secret+'&ll='+req.params.ll+'&limit=10'}
  , function (error, response, body) {

      if (!error && response.statusCode == 200) {
        var venues = JSON.parse(body);
        // TODO: sort by trending with underscore
        // TODO: for each place id, get_place
        res.send(body); 
      }
    })
});

app.get('/song/:code'
, function(req, res) { 
    res.send(get_song(req.params.code));
});

var echonest_key = '3XHF2NDEZOK0Y1CLM';

var get_song = function(code) {
  request({uri: 'http://developer.echonest.com/api/v4/song/identify?api_key='+echonest_key+'&code='+code}
  , function (error, response, body) {
      Song = mongoose.model('Song');
      var song = null;
      sys.puts('status: ' + response.statusCode);

      if (!error && response.statusCode == 200) {

        var songs = JSON.parse(body).response.songs;

        // Default to the best song ever if none was found
        if ( songs.size == 0 ) {
          song = new Song();
          song.id = 'RICKASTLEY';
          song.title = 'Never gonna give you up';
          song.artist = 'Rick Astley';
          song.save();
        }

        // Try and load a cached version of the song
        song = Song.findById(underscore.first(songs).id);

        // If the cache misses, add new info
        if ( song.title == null ) {
          song = new Song();
          song.title = underscore.first(songs).title
          song.artist = underscore.first(songs).artist_name
          song.id = underscore.first(songs).id
          song.save();
        }
        sys.puts(JSON.stringify(song));

        return song;
      }
   })
};

// tag a song
app.put('/tag/:user/:venue/:song', function(req, res) {
  var tag = new Tags();

  // user == email
  tag.user = JSON.parse(req.params.user);
  // venue == 
  tag.venue = JSON.parse(req.params.venue);
  tag.song = JSON.parse(req.params.song);

  tag.save(basic_error_handling)
}); 

app.get('/user/:user', function(req, res) {
  res.send('users here');
});


// get the last tags of a venue
app.get('/venue/:venue/tags', function(req, res) {
  var tags = Tags.find({'venue': req.params.venue}, {}, {'limit': 10}, lol_error_handling);
  res.send(tags);
});

// get venue info
app.get('/venue/:venue', function(req, res) {
  Venue.find({'venue': req.params.venue}, {}, {}, lol_error_handling)
});

// basic error handling
var basic_error_handling = function(err) {
  sys.puts('BASIC ERROR HANDLING')
};

// fake error handling
var lol_error_handling = function(err, docs) {
  sys.puts('LOL ERROR HANDLING')  
};

app.listen(3000);
