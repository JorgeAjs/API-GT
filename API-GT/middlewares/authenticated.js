'use strict'

const jwt = require('jwt-simple')
const moment = require('moment')
var secret = 'clave_secreta'

exports.ensureAuth = function (req, res, next){
  if(!req.headers.authorization){
    return res.status(403).send({message: `La petición no tiene la cabecera de autenticación`})
  }

  var token = req.headers.authorization.replace(/['"]+/g,'')

  try {
    var payload = jwt.decode(token,secret)
    if(payload.exp <= moment().unix()){
      console.log(err)
      return res.status(401).send({message: `El token ha expirado`})
    }
  }catch(err){
      console.log(err)
      return res.status(403).send({message: `El token no es valido`})
  }

  req.user = payload

  next()
}
