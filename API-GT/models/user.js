'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
//var Ticket = mongoose.model('Ticket')

const userSchema = Schema({
  role: String,
  name: String,
  lastname: String,
  zipCode: String,
  country: String,
  city:String,
  region: String,
  typeDoc:String,
  document:String,
  birthDate: Date,
  email : { type: String, unique:true, lowercase: true},
  avatar: String,
  password: String,
  signupDate: { type: Date, default: Date.now() },
  lastLogin: Date,
  nit: String,
  address: String,
  phone: String,
  mobile:String,
  website:String,
  nameRep :String,
  lastnameRep:String,
  typeDocRep:String,
  documentRep:String,
  phoneRep:String,
  mobileRep:String,
  status:String,
  acceptTerms1:Boolean,
  acceptTerms2:Boolean,
  bankAccountNumber:String,
  gender:String,
  occupation:String,
  stratum:String,
  producerCode:String,
  eventTypes : { type : Array , "default" : [] }   // Array de tipos de eventos
})

var collectionName = 'User'
var User = mongoose.model('User', userSchema,collectionName)
module.exports = User
//module.exports = mongoose.model('User',userSchema)
