'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VenueSchema = Schema({
  country: String,
  city: String,
  department: String,
  address: String,
  stage: String,
  picture: String,
  locationsPicture: String,
  googleMaps : String,
  capacity: String,
  stageLocations: [{ type: Schema.ObjectId, ref:'StageLocation'}] // Array de ID's de locations
})


var collectionName = 'Venue'
var Venue = mongoose.model('Venue', VenueSchema,collectionName)
module.exports = Venue

