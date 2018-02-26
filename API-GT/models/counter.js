'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CounterSchema = Schema({
    name: {type:String, unique:true},
    currentValue: Number,
    lastUpdated: Date
})

var Counter = mongoose.model('Counter', CounterSchema)
module.exports = Counter