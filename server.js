var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps;
var Email = mongoose.SchemaTypes.Email;
mongoose.connect('mongodb://localhost/soundscape');

var Person = new Schema({
    name  : String
  , email : Email 
  , phone : { type: Number, min: 1000000000, max: 99999999999 }
  , tags  : [Tag]
});

var Song = new Schema({
    artist  : String
  , title   : String
  , album   : String
  , release : Date
}); 

var Venue = new Schema({
    name : String
  , type : { type: String, enum: ['cafe', 'bar', 'club'] }
  , lat  : { type: Number, min: -90, max: 90 }
  , lon  : { type: Number, min: -90, max: 90 }
  , tags : [Tag]
});

var Tag = new Schema({
    user     : Person
  , song     : Song
  , venue    : Venue
  , lat      : { type: Number, min: -90, max: 90 }
  , lon      : { type: Number, min: -90, max: 90 }
  , date     : Date
  , like     : Boolean
}); 

mongoose.model('Person', Person)
mongoose.model('Song', Song)
mongoose.model('Venue', Venue)
mongoose.model('Tag', Tag)
var app = require('express').createServer();
var request = require('request');
var sys = require('sys');

// what venue is this?
app.get('/venue', function(req, res) {
  request({uri:'https://api.foursquare.com/v2/venues/search?client_id=JAQQS11NSBCQEP3RBZAVITCME54S3FSCWAZ1204KS1TMNRJY&client_secret=CLTMSOONEQ2HY4Y55RGJFUAWDRTQ5TIJ0XTIR3T4ZFL0STPF&ll='+req.ll}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      sys.puts(body)
    }
  })
  // get list of venues from foursquare
  // sort by our venue database by number of tags
  // return sorted list
});

app.listen(3000);

// get song
//  fake data  
// get /[venues]
// put / tag (song, user, venue)
