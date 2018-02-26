'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
//var Event = mongoose.model('Event')

const ticketSchema = Schema({
  charge: Number,
  stageLocation: {type: Schema.ObjectId, ref:'StageLocation'},
  date: Date, //Creation date
  encryptedCode: String,
  event: {type: Schema.ObjectId, ref:'Event'},
  idInvoice: String,
  paymentResponseId: String,
  price:Number,
  purchaseDate: Date,
  row: String,
  seat: String,
  section: String, 
  signature: String,  
  subtotal: Number,
  status: Number,
  total: Number, 
  used: Boolean, 
  user: {type: Schema.ObjectId, ref:'User'}  
})


var collectionName = 'Ticket'
var Ticket = mongoose.model('Ticket', ticketSchema,collectionName)
module.exports = Ticket


/*
1. Seleccion de caractertisticas de ticket: silla, secciont, localidad, precio.
  - Request API - processTicket - Almacenar un nuevo ticket con status 1 y retorna ticket con numero de factura para la pasarela de pagos
  1 - Pendiente
  2 - Pagado
  - Front. POST a pasalera de pagos con datos y redireccion. 
2. PayCo envia informacion directo al API y redirige al usuario a la pagina de respuesta (con la misma informacion del post)
  Si todo sale bien:
  - API actualiza el documento de Ticket con información recibida - Enviar correo al usuario con QR. 
    Almacenar un objeto de tipo epayco con la informacion 
  - Front muestra resultado de transaccion.
  Si falla:
  - API guarda documento de epayco. El ticket permanecera en estado pendiente durante 15-25 minutos (JOB API 10min). Si no hay confirmacion 
  de la transaccion en este tiempo se eliminara el ticket.
  - Front muestra resultado de transaccion.

  Agregar al modelo del API de ticket nuevo campo: paymentResponseId

 */
