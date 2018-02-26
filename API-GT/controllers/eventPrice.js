'use strict'
const EventPrice = require('../models/eventPrice')
const config = require('../config')


/**
 * Obtiene el listado de todos las precios
 * @method GET /eventPrices/:eventId/:salesStage?
 * @return Array de todos los eventos
 * 
 */
function getEventPrices (req, res) {
  let eventId = req.params.eventId
  let salesStage=null;
  if(req.params.salesStage){
    salesStage=req.params.salesStage;
  }
  let find;
  if(salesStage!=null){
    find = EventPrice.find({
      $and : [
         {
         "event":eventId,
         "salesStage" : salesStage
         }
      ]
    });
  }else{
    find = EventPrice.find({event:eventId});
  }
  find.populate([{path:'salesStage'},{path:'stageLocation'}]).exec((err,eventPrices) =>{
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!eventPrices) return res.status(404).send({message:`No existen precios`})
     //console.log(events)
    res.status(200).send({eventPrices})
  })
}


/**
 * Obtiene la información de un precio dado su ID de BD
 * @method GET /eventPrice/:stageId
 * @return Json con la información del stage
 * 
 */
function getEventPrice (req, res) {
  let locId = req.params.eventPriceId
  EventPrice.findById(locId).populate([{path:'salesStage'},{path:'stageLocation'}]).exec((err, eventPrice) => {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!eventPrice) return res.status(404).send({message:`La locacion no existe`})

    res.status(200).send({eventPrice:eventPrice})
  })
}

/**
 * Inserta un nuevo documento en la Collection de EventPrices
 * @method POST /eventPrice/'
 * @return Nuevo stage
 * 
 */
function saveEventPrice (req,res) {
  //console.log('POST /api/event')
  //console.log(req.body)

  let eventPrice = new EventPrice()
  eventPrice.price = req.body.price
  eventPrice.discount = req.body.discount
  eventPrice.discountPrice = req.body.discountPrice
  eventPrice.maxTicketsDiscount= req.body.maxTicketsDiscount
  eventPrice.discountStart = req.body.discountStart
  eventPrice.discountEnd =  req.body.discountEnd
  eventPrice.salesStage = req.body.salesStage
  eventPrice.stageLocation = req.body.stageLocation
  eventPrice.event = req.body.event
  eventPrice.save((err,eventPriceStored) => {
    if (err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    res.status(200).send({eventPrice: eventPriceStored})
  })
}

/**
 * Inserta un array de nuevos documento en la Collection de EventPrices
 * @method POST /eventPrices/'
 * @return Array staylocations, numItems added
 * 
 */
function saveEventPriceArray (req,res) {
  //console.log('POST /api/event')
  //console.log(req.body)
  let docsArray=[];
  for (var key in req.body) {
    let doc=req.body[key]
    let eventPrice = new EventPrice()
    eventPrice.price = doc.price
    eventPrice.discount = doc.discount
    eventPrice.discountPrice = doc.discountPrice
    eventPrice.maxTicketsDiscount= doc.maxTicketsDiscount
    eventPrice.discountStart = doc.discountStart
    eventPrice.discountEnd =  doc.discountEnd
    eventPrice.salesStage =doc.salesStage
    eventPrice.stageLocation = doc.stageLocation
    eventPrice.event = doc.event
    docsArray.push(eventPrice)
  };
  EventPrice.collection.insert(docsArray,(err,result) => {
    if (err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    if(!result) res.status(404).send({message: `No se pudo insertar los documentos`})
    res.status(200).send({result: result})
  })
}

/*
 * Actualiza la información de un eventPrice
 * @method PUT: /eventPrice/:eventPriceId
 * @return Json con el usuario actualizado
 * 
 */
function updateEventPrice(req, res){
  let eventId = req.params.eventPriceId
  let update = req.body

  EventPrice.findByIdAndUpdate(eventId, { $set: update}, (err, priceUpdated) => {
    if (err) res.status(500).send({ messsage: `Error al actualizar la localidad ${err}`})

    if(!priceUpdated) res.status(404).send({message: `No se ha podido actualizar la localidad`})

    return res.status(200).send({ eventPrice: priceUpdated})
  })
}

/*
 * Actualiza la información de un eventPrice
 * @method PUT: /eventPrices/
 * @return Json con el usuario actualizado
 * No usar esta funcion, genera problemas debido a la respuesta asyncrona
 * 
 */
function updateEventPriceArray(req, res){

 var numOfDocs = req.body.length;
  function loopArray(i,until,onEnd)
  {
    if (i <= until)
    {
      let doc=req.body[i-1]
      let eventId=doc._id      
      console.log(eventId);
      EventPrice.findByIdAndUpdate(eventId, { $set: doc}, (err, priceUpdated) => {
      if (err) 
        return res.status(500).send({ messsage: `Error al actualizar precio de evento ${err}`})

      if(!priceUpdated) 
        return res.status(404).send({message: `No se ha podido actualizar el precio`})        

        loopArray(i+1,until,onEnd)
      })
    }
    else
      onEnd()
  }

  loopArray(1,numOfDocs,function() {return res.status(200).send({ result: numOfDocs+" items updated"})})

}

module.exports = {
  getEventPrices,
  getEventPrice,
  saveEventPrice,
  saveEventPriceArray,
  updateEventPrice,
  updateEventPriceArray
}