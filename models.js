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
