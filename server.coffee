underscore = require 'underscore'

mongoose = require 'mongoose'
mongooseTypes = require "mongoose-types"

useTimestamps = mongooseTypes.useTimestamps
Email = mongoose.SchemaTypes.Email
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

Song = new Schema
  artist      : String
  title       : String
  album       : String
  echonest_id : ObjectId

mongoose.model 'Song', Song

Person = new Schema
  name  : String
  email : [Email]
  phone : { type: Number, min: 1000000000, max: 99999999999 }

mongoose.model 'Person', Person

Venues = new Schema
  name     : String
  distance : Number
  category : String
  icon_uri : String
  history  : ObjectId

mongoose.model 'Venues', Venues

Tags = new Schema
  user_id  : ObjectId # soundscape
  song_id  : ObjectId # mongo
  venue_id : ObjectId # foursquare
  lat      : { type: Number, min: -90, max: 90 }
  lon      : { type: Number, min: -90, max: 90 }
  date     : Date
  like     : Boolean

mongoose.model 'Tags', Tags

app = require('express').createServer()
request = require 'request'
sys = require 'sys'
foursquare_id = 'JAQQS11NSBCQEP3RBZAVITCME54S3FSCWAZ1204KS1TMNRJY'
foursquare_secret = 'CLTMSOONEQ2HY4Y55RGJFUAWDRTQ5TIJ0XTIR3T4ZFL0STPF'

db = mongoose.connect 'mongodb://localhost/soundscape'

# get a list of the most likely venues
app.get '/venue/:list/:ll', (req, res) ->
  request {uri:"https://api.foursquare.com/v2/venues/search?client_id=#{foursquare_id}&client_secret=#{foursquare_secret}&ll=#{req.params.ll}&limit=10"}, (error, response, body) ->
    Venues = mongoose.model 'Venues'

    if not error and response.statusCode is 200
      # grab possible venues from underscore
      vs = underscore.first(underscore.select(JSON.parse(body).response.groups, (group) -> group.type is req.params.list )).items
      
      venues = for v in vs
        venue = Venues.findById v.id
        
        # create a new venue if its not already cached
        if not venue.name
          venue = new Venues
          venue.name = v.name
          venue.distance = v.location.distance
          cat = underscore.first v.categories

          if cat
            venue.category = cat.name
            venue.icon_uri = cat.icon
          venue.save()

        venue
    res.send venues
    return
  return

echonest_key = '3XHF2NDEZOK0Y1CLM'

# get a song
app.get '/song/:code', (req, res) ->
    code = req.params.code
    request {uri: "http://developer.echonest.com/api/v4/song/identify?api_key=#{echonest_key}&code=#{code}"}, (error, response, body) ->
        Song = mongoose.model 'Song'
        song = null

        if not error and response.statusCode is 200
            songs = JSON.parse(body).response.songs

            # Default to the best song ever if none was found
            if songs.size is 0
                song = new Song
                song.id = 'RICKASTLEY'
                song.title = 'Never gonna give you up'
                song.artist = 'Rick Astley'
                song.save()

          # Try and load a cached version of the song
          song = Song.findById(underscore.first(songs).id)

          # If the cache misses, add new info
          if song.title is null
            song = new Song
            song.title = underscore.first(songs).title
            song.artist = underscore.first(songs).artist_name
            song.id = underscore.first(songs).id
            song.save()

      res.send(song)
      return

# the user (dis)liked the song at venue
app.get '/tag/:user/:like/:song/:venue', (req, res) ->
    Tags = mongoose.model 'Tags'
    tag = new Tags
    tag.user = req.params.user
    tag.venue = req.params.venue
    tag.song = req.params.song
    tag.like = !!a
    tag.save()

# get a user's tags
app.get '/user/:email/tags', (req, res) ->
    Tags = mongoose.model 'Tags'
    Tags.find {'user': req.params.email}, {}, {}, (err, tags) ->
        res.send tags

# add a user
app.get '/user/:email/:name/:phone', (req, res) ->
    Person = mongoose.model 'Person'
    person = null

    Person.findOne {email: req.params.email}, (err, p) ->
        person = p

    if !person?
        person = new Person
        person.name = req.params.name
        person.email = req.params.email
        person.phone = req.params.phone
        person.save()

    res.send person

# find user 
app.get '/user/:email', (req, res) ->
    Person = mongoose.model 'Person'
    Person.findOne {email: req.params.email}, (err, person) ->
        res.send person

# get the last tags of a venue
app.get '/venue/:name/tags', (req, res) ->
    Venues = mongoose.model 'Venues'
    Tags.find {name: req.params.name}, {}, {'limit': 10}, (err, tags) ->
        res.send tags

# get venue info
app.get '/venue/:name', (req, res) ->
    Venues = mongoose.model 'Venues'
    Venues.findOne {name: req.params.name}, (err, venue) ->
        res.send venue

app.listen 3000
