'use strict'
const Promotor = require('../models/promotor')
const Event = require('../models/event')
const bcrypt = require('bcrypt-nodejs')



/*
 * Obtiene el detalle de un Promotor dado su ID
 * @method /api/promotors/:promotorId'
 * @return Json con la información del Promotor
 * 
 */
function getPromotor (req, res){
  let promotorId = req.params.promotorId

  Promotor.findById(promotorId, (err, promotor) => {
    if (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})

    if(!promotor) return res.status(404).send({message:`El producto no existe`})

    return res.status(200).send(promotor)
  })
}

/*
 * Obtiene el listado de todos los promotores
 * @method /api/promotor/'
 * @return Json con la información del Promotor
 * 
 */
function getPromotors (req, res){
  Promotor.find({}, (err, promotors) => {
    if (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!promotors) return res.status(404).send({message:`El producto no existe`})

    return res.status(500).send(promotors)
  })
}

/*
 * Obtiene el listado de todos los eventos activos de un Promotor
 * @method /api/events/promotor/actives/:promotorId'
 * @return Array de todos los eventos activos de un Promotor
 * 
 */

function getEventsActivebyPromotorId(req,res){
   let promotorId = req.params.promotorId
   let resultEvents = [];
  Promotor.findOne({
	$and : [
         {"_id":promotorId},
				 {"status" : "Active"}
			   
			 ]

  }, {'events':1}, function (err, eventos) {

      if (!eventos) return res.status(404).send({message: 'No existen eventos activos para el promotor'})
      if(eventos.events.length>0){

                for (var i = 0;i<eventos.events.length;i++){
                  console.log(eventos.events[i]);
                  Event.findById(eventos.events[i],function(err,eventsProducer){
                  resultEvents.push(eventsProducer);
                    
                      if (err) return res.status(500).send({message: 'Error al realizar la petición'})
                      if (!eventsProducer) return res.status(404).send({message: 'No existen eventos para el promotor'})
                      res.status(200).send({resultEvents})
                    
                  })
                }
      }else{
         return res.status(404).send({message: 'No existen eventos para el promotor'})
      }
       

	})
}


/*
 * Obtiene el listado de todos los eventos de un productor activos o inactivos
 * @method /api/promotor/events/:promotorId'
 * @return Array de todos los eventos activos
 * 
 */
function getAllEventsbyPromotorId(req,res){
  let promotorId = req.params.promotorId
  let resultEvents = [];
  Promotor.findById(promotorId, {'events':1}).populate('events').exec(function(err, eventsProducer){
      if (err) return res.status(500).send({message: 'Error al realizar la petición'})
      if (!eventsProducer) return res.status(404).send({message: 'No existen eventos para el promotor'})
      res.status(200).send({eventsProducer})
 })
}

/*
 * Almacena los registos en la Collection de Promotor
 * @method POST: /api/promotor/events/:promotorId'
 * @return Array de todos los eventos activos
 * 
 */
function savePromotor (req, res){
  console.log('POST api/promotor')
  let data = req.body
  console.log(data)
  let promotor = new Promotor()
  promotor.email = data.email
  promotor.displayName = data.displayName
  promotor.avatar = data.avatar
  promotor.password = data.password
  promotor.signupDate = new Date().toISOString() //Ojo esta arrojando la hora mal.
  promotor.lastLogin = new Date().toISOString()
  promotor.nit = data.nit
  promotor.address = data.address
  promotor.phone = data.phone
  promotor.mobile = data.mobile
  promotor.website = data.website
  promotor.nameRep = data.nameRep
  promotor.lastnameRep = data.lastnameRep
  promotor.typeDocRep = data.typeDocRep
  promotor.documentRep = data.documentRep
  promotor.phoneRep = data.phoneRep
  promotor.mobileRep = data.mobileRep
  promotor.status = "Pending"
  promotor.eventTypes = data.eventTypes

  promotor.validate((err) => {
    if (err) return res.status(500).send({message:`Datos recibidos incorrectos ${err}`})

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send({message:`Error en servidor ${err}`})

      bcrypt.hash(promotor.password, salt, null, (err, hash) => {
        if (err) return res.status(500).send({message:`Error en servidor ${err}`})

        promotor.password = hash

        promotor.save( (err, promotorStored) => {
          if(err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})

          return res.status(200).send({promotor: promotorStored})
        })
      })
    })
  })
}

/*
 * Actualiza los registos en la Collection de Promotor
 * @method POST: /api/promotor/events/:promotorId'
 * @return Array de todos los eventos activos
 * 
 */

function updatePromotor (req, res){
  let promotorId = req.params.promotorId
  let update = req.body
  Promotor.findByIdAndUpdate(promotorId, {$set:update}, (err, promotorUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el promotor ${err}`})

    return res.status(200).send({ promotor: promotorUpdated})
  })
}

/*
 * Actualiza el estado de Promotor a activo
 * @method POST: /api/promotor/activate/:promotorId'
 * @return Promotor actualizado
 * 
 */

function activatePromotor (req, res){
  let promotorId = req.params.promotorId
  Promotor.findByIdAndUpdate(promotorId, {"status":"Active"}, (err, promotorUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el promotor ${err}`})

    return res.status(200).send({ promotor: promotorUpdated})
  })
}


/*
 * Actualiza el estado de Promotor a Inactivo
 * @method POST: /api/promotor/deactivate/:promotorId'
 * @return Promotor actualizado
 * 
 */

function deactivatePromotor (req, res){
  let promotorId = req.params.promotorId
  Promotor.findByIdAndUpdate(promotorId, {"status":"Inactive"}, (err, promotorUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el promotor ${err}`})

    return res.status(200).send({ promotor: promotorUpdated})
  })
}
/*
function deletePromotor (req, res){
  let promotorId = req.params.promotorId

  Promotor.findById(promotorId, (err, promotor) => {
    if (err) return res.status(500).send({message:`Error al eliminar en la base de datos ${err}`})

    promotor.remove( err => {
      if (err) return res.status(500).send({message:`Error al eliminar en la base de datos ${err}`})

      return res.status(200).send({message:`El promotor a sido borrado`})
    })
  })
}
*/
module.exports = {
  getPromotor,
  getPromotors,
  getEventsActivebyPromotorId,
  getAllEventsbyPromotorId,
  savePromotor,
  updatePromotor,
  activatePromotor,
  deactivatePromotor

}
