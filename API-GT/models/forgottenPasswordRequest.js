'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ForgottenPasswordRequestSchema = Schema({
    user:{ type:Schema.ObjectId, ref: 'User'},
    authorizationCode: String,
    date: Date
})

var ForgottenPasswordRequest = mongoose.model('ForgottenPasswordRequest', ForgottenPasswordRequestSchema)
module.exports = ForgottenPasswordRequest