'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ScanningAuthorizationSchema = Schema({
    authorizationCode: {type:String, unique:true},
    event: {type: Schema.ObjectId, ref:'Event'},
    idNumber: String    
})

var ScanningAuthorization = mongoose.model('ScanningAuthorization', ScanningAuthorizationSchema)
module.exports = ScanningAuthorization