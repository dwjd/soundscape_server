var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types"), useTimestamps = mongooseTypes.useTimestamps;
var Email = mongoose.SchemaTypes.Email;
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var underscore = require('underscore');

var Song = new Schema({
    artist      : String
  , title       : String
  , album       : String
  , echonest_id : ObjectId
}); 
mongoose.model('Song', Song);

var Person = new Schema({
    name  : String
  , email : [Email] 
  , phone : { type: Number, min: 1000000000, max: 99999999999 }
});
mongoose.model('Person', Person);

var Venues = new Schema({
    name     : String
  , distance : Number
  , category : String
  , icon_uri : String
  , history  : ObjectId
});
mongoose.model('Venues', Venues);

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
var foursquare_id = 'JAQQS11NSBCQEP3RBZAVITCME54S3FSCWAZ1204KS1TMNRJY'
  , foursquare_secret = 'CLTMSOONEQ2HY4Y55RGJFUAWDRTQ5TIJ0XTIR3T4ZFL0STPF';

var db = mongoose.connect('mongodb://localhost/soundscape');

// get a list of the most likely venues
app.get('/venue/:list/:ll', function(req, res) {
  request({uri:'https://api.foursquare.com/v2/venues/search?client_id='+foursquare_id+'&client_secret='+foursquare_secret+'&ll='+req.params.ll+'&limit=10'}
  , function (error, response, body) {

      Venues = mongoose.model('Venues');
      var venues = new Array();
      
      if (!error && response.statusCode == 200) {
        // grab possible venues from underscore
        var vs = underscore.first(underscore.select(JSON.parse(body).response.groups, function(group) { return group.type == req.params.list })).items;
        for ( var i=0, len=vs.length; i<len; ++i ){
          var v = vs[i];
          var venue = Venues.findById(v.id);
          if(venue.name == null) {
            venue = new Venues();
            venue.name = v.name;
            venue.distance = v.location.distance;
            var cat = underscore.first(v.categories);
            if( cat != null ) {
              venue.category = cat.name;
              venue.icon_uri = cat.icon;
            }
            venue.save();
          } 
          venues.push(venue);
        }
      }
      res.send(venues);
    })
});

var echonest_key = '3XHF2NDEZOK0Y1CLM';
// get a song
app.get('/song/:code'
  , function(req, res) {
  var code = req.params.code;
  request({uri: 'http://developer.echonest.com/api/v4/song/identify?api_key='+echonest_key+'&code='+code}
  , function (error, response, body) {
      Song = mongoose.model('Song');
      var song = null;

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

        res.send(song);
      }
   })
});

// tag a song
app.get('/tag/:user/:venue/:song', function(req, res) {
  Tags = mongoose.model('Tags');
  var tag = new Tags();

  tag.user = req.params.user;
  tag.venue = req.params.venue;
  tag.song = req.params.song;

  tag.save(basic_error_handling)
}); 

// get a user's tags
app.get('/:user/tags', function(req, res) {
  Tags = mongoose.model('Tags');
  var tags = Tags.find({'user': req.params.user}, {}, {}, lol_error_handling);
  res.send(tags);
});

// add a user
app.get('/user/:name/:email/:phone', function(req, res) {
  Person = mongoose.model('Person');

  var person = Person.find({'email': req.params.email}, {}, {}, lol_error_handling);

  if ( person == null ) {
    person = new Person();

    person.name = req.params.name;
    person.email = req.params.email;
    person.phone = req.params.phone;
  
    person.save(basic_error_handling); 
  }

  res.send(person);
});

// find user 
app.get('/user/:email', function(req, res) {
  Person = mongoose.model('Person');
  var person = Person.find({'email': req.params.email}, {}, {}, lol_error_handling);
  res.send(person);
});


// get the last tags of a venue
app.get('/venue/:venue/tags', function(req, res) {
  Venues = mongoose.model('Venues');
  var tags = Tags.find({'name': req.params.venue}, {}, {'limit': 10}, lol_error_handling);
  res.send(tags);
});

// get venue info
app.get('/venue/:venue', function(req, res) {
  Venues = mongoose.model('Venues');
  var venues = Venues.find({'name': req.params.venue}, {}, {}, lol_error_handling)
  res.send(venues)
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
