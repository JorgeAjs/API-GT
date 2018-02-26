'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalesStageSchema = Schema({
  from: Date,
  to: Date,
  promotion: Boolean,
  name: String
})


var collectionName = 'SalesStage'
var SalesStage = mongoose.model('SalesStage', SalesStageSchema,collectionName)
module.exports = SalesStage