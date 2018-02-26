'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
//var Venue = mongoose.model('Venue')

const EventSchema = Schema({
  category: { type : Array , "default" : [] },
  creationDate: Date,
  date: Date,
  description: String,
  eventLocations: [{ type: Schema.ObjectId, ref:'StageLocation'}], // Array de ID's de locations
  mainArtist: { type : String, "default" : "" },  
  notes: String,
  otherArtists: { type : String, "default" : "" },
  picture: String,
	promoted:Boolean,
  salesStages: [{ type: Schema.ObjectId, ref:'SalesStage'}], // Array de ID's de salesStage
  status:String,  
  tags: { type : Array , "default" : [] },
  title: String,	
  time_zone: String,      
  user:{ type:Schema.ObjectId, ref: 'User'},
  venue:{ type:Schema.ObjectId, ref: 'Venue'} 
})
EventSchema.index({title:'text',description:'text'})

var collectionName = 'Event'
var Event = mongoose.model('Event', EventSchema,collectionName)
module.exports = Event


//module.exports =  mongoose.model('Event', EventSchema)