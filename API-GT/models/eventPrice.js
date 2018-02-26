'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventPriceSchema = Schema({
  discount:Number,
  discountType:String,
  maxTicketsDiscount:String,
  discountStart:Date,
  discountEnd:Date,
  price: Number,
  salesStage:{ type:Schema.ObjectId, ref: 'SalesStage'},
  stageLocation:{ type:Schema.ObjectId, ref: 'StageLocation'},
  event: { type:Schema.ObjectId, ref: 'Event'}
})


var collectionName = 'EventPrice'
var EventPrice = mongoose.model('EventPrice', EventPriceSchema,collectionName)
module.exports = EventPrice