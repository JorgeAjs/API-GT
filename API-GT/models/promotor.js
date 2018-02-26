'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PromotorSchema = new Schema({
  email : { type: String, unique:true, lowercase: true},
  displayName: String,
  avatar: String,
  password: { type: String, select: false},
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
  eventTypes : { type : Array , "default" : [] },   // Array de tipos de eventos
  events: [{ type: Schema.ObjectId, ref:'Event'}] // Array de ID's de eventos
})

/*PromotorSchema.pre('save', (next) => {
  let promotor = this
  if (!promotor.isModified('password')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next()

    bcrypt.hash(promotor.password, salt, null, (err, hash) => {
      if (err) return next(err)

      promotor.password = hash
      next()
    })
  })
})*/

/*
PromotorSchema.methods.gravatar = function () {
  if (!this.email) return `htts://gravatar.com/avatar/?s=200&d=retro`

  const md5 = crypto.createHash('md5').update(this.email).digest('hex')
  return `https://gravatar.com/avatar/${md5}?s=200&d=retro`
}
*/
//module.exports = mongoose.model('Promotor', PromotorSchema)
var collectionName = 'Promotor'
var Promotor = mongoose.model('Promotor', PromotorSchema,collectionName)
module.exports = Promotor
