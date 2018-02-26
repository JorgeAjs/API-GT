'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StageLocationSchema = Schema({
  name: String,
  capacity: Number,
  prefix: String,
  startNumber: Number,
  endNumber: Number,
  sufix:String,
  chairLocation:Boolean,
  svgId:String
})


var collectionName = 'StageLocation'
var StageLocation = mongoose.model('StageLocation', StageLocationSchema,collectionName)
module.exports = StageLocation