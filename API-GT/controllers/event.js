'use strict'
const Event = require('../models/event')
const config = require('../config')


const fs = require('fs');
const path = require('path');

/*
 * Obtiene el listado de todos los eventos, paginados
 * @method /api/events
 * @return Array de todos los eventos
 */
function getEvents (req, res) {
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  
  let find = Event.find({}).sort('date');
  find.populate({path:'venue'}).paginate(page,itemsPerPage,(err,events, total) =>{
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!events) return res.status(404).send({message:`No existen eventos`})
     //console.log(events)
    res.status(200).send({totalItems:total,events:events})
  })
}


/*
 * Obtiene la información de un evento dado su ID de BD
 * @method /api/event/eventId
 * @return Json con la información del evento
 */
function getEvent (req, res) {
  let eventId = req.params.eventId
  Event.findById(eventId).populate([{path:'venue',populate:{path:'stageLocations',model:'StageLocation'}},{path:'eventLocations'},{path:'salesStages'},{path:'user'}]).exec((err, event) => {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!event) return res.status(404).send({message:`El evento no existe`})

    res.status(200).send({event:event})
  })
}


/*
 * Obtiene el listado de todos los eventos promocionados
 * @method /api/events/promoted'
 * @return Array de todos los eventos promocionados
 */
function getEventsPromoted(req, res){
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  
  let find = Event.find({
		  $and : [
			   {
				 "promoted":true,
				 "status" : "Active"
			   }
			]
		}).sort('date');
    find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
		if (err) return res.status(500).send({message: 'Error al realizar la petición'})
		if (!events) return res.status(404).send({message: 'No existen eventos'})
		res.status(200).send({totalItems:total,events:events})
	})
}

/*
 * Obtiene el proximo evento (evento mas cercano a la fecha actual Activo)
 * @method /api/events/next'
 * @return Evento
 * 
 */
function getNextEvent(req, res){
  let find = Event.findOne({
         $and : [
         {"date" : {"$gte" : new Date()}},
         {"status" : "Active"}
       ]
    }).sort('date');
    find.populate({path:'venue'}).exec(function (err, event) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!event) return res.status(404).send({message: 'No existen eventos'})
    res.status(200).send({event:event})
  })
}


/*
 * Obtiene el listado de los eventos por busqueda
 * @method /api/events/search/:text'
 * @return Array de todos los eventos promocionados
 * 
 */
function getEventsSearch(req, res){
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let text=req.params.text;
  let itemsPerPage=config.itemsPerPage;
  
  let textSplit=text.trim().split(" ");
  let find;
  if(textSplit.length>1){
    find = Event.find({
      $text : { $search : text,$language: "es" }
    }).sort('date');
  }else{
    find = Event.find({
    $or:[
       {"title": {$regex: text, $options: "i"}},
       {"description": {$regex: text,$options: "i"}}
      ]
    }).sort('date');
  }
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen eventos que concuerden con la busqueda'})
    res.status(200).send({totalItems:total,events:events})
  })
}

/*
 * Obtiene el listado de todos los eventos activos
 * @method /api/events/active'
 * @return Array de todos los eventos activos
 */

function getEventsActive(req,res){
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  
  let find = Event.find({"status":"Active"}).sort('date');
  find.populate({path:'venue'}).paginate(page,itemsPerPage, function (err, events,total) {
		if (err) return res.status(500).send({message: 'Error al realizar la petición'})
		if (!events) return res.status(404).send({message: 'No existen Eventos'})
	    //console.log(eventos)
	    //res.json(products)
		res.status(200).send({totalItems:total,events:events})
	})

}

/*
 * Obtiene el listado de todos los eventos activos de un tipo o varios tipos, si son varios
 * tipos deben estar separados por el caracter ":"
 * @method /api/events/type/:type'
 * @return Array de todos los eventos activos
 * 
 */
function getEventsbyType(req,res){
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  let type = req.params.type
  let types=type.split(":")
  let orObj=[]
  for(let i=0;i<types.length;i++){
      let obj={"category":types[i]}
      orObj.push(obj)
  }
  let find = Event.find({
      $and : [
          {$or: orObj},
          {"status" : "Active"}
        ]
    }).sort('date');
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen eventos'})
      //console.log(events)
      //res.json(products)
    res.status(200).send({totalItems:total,events:events})
  })
}



/*
 * Obtiene el listado de todos los eventos activos entre hoy y una fecha específica incluyendola
 * @method /api/events/soon/:datevent'
 * @return Array de todos los eventos activos
 */

function getEventsSoon(req,res){ 
  let datevent = req.params.datevent
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  let type = req.params.type
  let find = Event.find({ 
	       $and : [
			   {"date" : {"$gte" : new Date()}},
				 {"date" : {"$lte" :new Date(datevent)}}, //T00:00:00Z")
				 {"status" : "Active"}
			 ]
	}).sort('date');   
	find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
		if (err) return res.status(500).send({message: 'Error al realizar la petición'})
		if (!events) return res.status(404).send({message: 'No existen eventos'})
	    //console.log(events)
	    //res.json(products)
		res.status(200).send({totalItems:total,events:events})
	})
}

 /*
 * Obtiene los eventos en un rango de fecha-tiempo de evento determinado. 
 * Parametros enviados en el url como "userId", from,to.
 * Si no se envia parametro de usuario (productor) envia la lista de todos los eventos en el rango dado
 * @method api/events/dates/:from/:to/:userId?/:page?
 * @return Resultado
 * 
 */
function getEventsInRange(req,res){
  let page=1;
  let producerId=req.params.userId;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  let from=Date.parse(req.params.from);
  let to=Date.parse(req.params.to);
  if(isNaN(from) || isNaN(to)){
    return res.status(404).send({ message:`Formato de fecha no valido`})
  }
  let find;
  if(producerId){
    find = Event.find({ 
         $and : [
         {"user" : producerId},
         {"date" : {"$gte" : new Date(from)}},
         {"date" : {"$lte" :new Date(to)}}
       ]
    }).sort('date');
  }else{
    find = Event.find({ 
         $and : [
         {"date" : {"$gte" : new Date(from)}},
         {"date" : {"$lte" :new Date(to)}}
       ]
    }).sort('date');
  }
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen Eventos'})
    res.status(200).send({totalItems:total,events:events})
  })
}

/*
 * Obtiene el listado de todos los eventos de un productor activos o inactivos
 * @method /api/events/producer/:userId/:page?'
 * @return Array de todos los eventos activos
 */
function getEventsProducer(req,res){
  let producerId = req.params.producerId
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  let find = Event.find({"user" : producerId}).sort('date');
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen eventos'})
      //console.log(events)
      //res.json(products)
    res.status(200).send({totalItems:total,events:events})
  })
}

/*
 * Obtiene el listado de todos los eventos activos de un producer
 * @method /api/events/producer/active/:userId/:page?
 * @return Array de todos los eventos activos de un producer
 */

function getEventsProducerActive(req,res){
  let producerId = req.params.userId
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  let find = Event.find({ 
         $and : [
         {"user" : producerId},
         {"status" : "Active"}
       ]
  }).sort('date');
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen eventos'})
      //console.log(events)
      //res.json(products)
    res.status(200).send({totalItems:total,events:events})
  })
}

/*
 * Obtiene el listado de todos los eventos activos de un productor entre hoy y una fecha específica incluyendola
 * @method /api/events/producer/soon/:userId/:datevent/:page?'
 * @return Array de todos los eventos activos
 */

function getEventsProducerSoon(req,res){ 
  let datevent = req.params.datevent
  let producerId = req.params.userId
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  let type = req.params.type
  let find = Event.find({ 
         $and : [
         {"date" : {"$gte" : new Date()}},
         {"date" : {"$lte" :new Date(datevent)}}, //T00:00:00Z")
         {"user" : producerId},
         {"status" : "Active"}
       ]
  }).sort('date');   
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen eventos'})
    res.status(200).send({totalItems:total,events:events})
  })
}

/*
 * Obtiene el listado de eventos por busqueda en los campos de titulo o descripcion de un productor
 * @method /api/events/producer/search/:userId/:text/:page?'
 * @return Array de los eventos encontrados
 */
function getEventsProducerSearch(req, res){
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  let text=req.params.text;
  let itemsPerPage=config.itemsPerPage;
  let producerId = req.params.userId
  let textSplit=text.trim().split(" ");
  let find;
  if(textSplit.length>1){
    find = Event.find({
      $and : [
       {"user" : producerId},
       {$text : { $search : text,$language: "es" }}
      ]
    }).sort('date');
  }else{
    find = Event.find({
      $and : [
      {"user" : producerId},
      {$or:[
       {"title": {$regex: text, $options: "i"}},
       {"description": {$regex: text,$options: "i"}}
      ]}
      ]
    }).sort('date');
  }
  find.populate({path:'venue'}).paginate(page,itemsPerPage,function (err, events,total) {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'})
    if (!events) return res.status(404).send({message: 'No existen eventos que concuerden con la busqueda'})
    res.status(200).send({totalItems:total,events:events})
  })
}

function uploadImage(req,res){
  var eventId = req.params.eventId;
  
  if(req.file){
    var file_name= req.file.filename;
    Event.findByIdAndUpdate(eventId,{picture: file_name},function(err,eventUpdated){
      if(err){
        res.status(500).send({message:"Error updating event"});
      }else{
        if(!eventUpdated){
          res.status(404).send({message:"could not update event"});
        }else{
          res.status(200).send({picture:file_name,event:eventUpdated});
        }
      }
    });
    //console.log(file_path);
  }else{
    res.status(500).send({message:"Image not recieved"});
  }
}


/*
 * Inserta un nuevo documento en la Collection de Eventos
 * @method POST /api/events/'
 * @return Nuevo evento
 */
function saveEvent (req,res) {
  console.log('POST /api/event')
  //console.log(req.body)

  let event = new Event()
  event.title = req.body.title
  event.tags = req.body.tags
  event.description = req.body.description
  event.time_zone = config.CO_TimeZone
  event.date =req.body.date
  event.creationDate=req.body.creationDate
  //event.picture = req.body.picture
  event.category = req.body.category
  event.notes = req.body.notes
  event.status=req.body.status
	event.promoted=req.body.promoted
	event.venue=req.body.venue
  event.eventLocations=req.body.eventLocations
  event.salesStages=req.body.eventSalesStages
  event.user=req.body.user
  //console.log( event.date)
  event.save((err,eventStored) => {
    if (err) res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    res.status(200).send({event: eventStored})
  })
}


/*
 * Actualiza un documento en la Collection de Eventos. Cualquier campo del documento
 * @method POST /api/events/'
 * @return Nuevo evento
 */
function updateEvent (req,res) {
  let eventId = req.params.eventId
  let update = req.body
  Event.findByIdAndUpdate(eventId,update,(err,eventUpdated) => {
    if (err) res.status(500).send({message:`Error al actualizar el evento: ${err}`})

    res.status(200).send({ event: eventUpdated })
  })
}


/*
 * Actualiza el estado de un documento dado su Id.  La idea es poder activarlo o desactivarlo según la necesidad
 * @method PUT /api/events/status/:eventId/:newstatus'
 * @return Nuevo evento
 */
function changeStatusEvent (req,res) {
  let eventId = req.params.eventId
  let newstatus = req.params.newstatus
Event.findByIdAndUpdate(eventId,{'status':newstatus},(err,eventUpdated) => {
    if (err) res.status(500).send({message:`Error al actualizar el evento: ${err}`})

    res.status(200).send({ event: eventUpdated })
  })
}

/**
 * Retorna la imagen enviada de la carpeta de imagenes de eventos
 * @method PUT /api/eventImage/:imageFile'
 * @return Archivo de imagen
 */
function getImageFile(req,res){
  var imageFile = req.params.imageFile;
  var file_path=config.eventImagePath+'/'+imageFile;
  
  fs.exists(file_path,function(exists){
    if(exists){
      res.sendFile(path.resolve(file_path));
    }else{
      res.status(200).send({message:"Image not found"});
    }
  });
}

/*
* Retorna el número de eventos próximos con una categoría determinada
* @method /api/tickets/:category
* @return Json los eventos ordenados por fecha y paginado
*/
function getNextEventsByCategory(req,res){

  let category = req.params.category, page=1, itemsPerPage=config.itemsPerPage;

  if(req.params.page){  page=req.params.page;  }   
  
  Event.find(
    {$and :  [  {"status":"Active"},{"category": category}, {"date": {$gte: new Date()}}  ]},
    null,{sort: {date: 1}}
    ).populate({path:'venue'}).paginate(page,itemsPerPage,(err,events) => {

    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`})
    if (!events) return res.status(404).send({ message:`No hay eventos para la categoría`})

    res.status(200).send({   events   })
  });
};

/*
function deleteEvent (req,res) {
  let eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) res.status(500).send({message:`Error al borrar el evento: ${err}`})

    event.remove(err => {
      if (err) res.status(500).send({message:`Error al borrar el evento: ${err}`})
      res.status(200).send({message:`El evento ha sido eliminado`})
    })
  })
}

*/
module.exports = {
  getEvents,
  getEvent,
  getNextEvent,
  getEventsPromoted,
  getEventsActive,
  getEventsbyType,
  getEventsSoon,
  getEventsSearch,
  getEventsInRange,
  getEventsProducer,
  getEventsProducerActive,
  getEventsProducerSoon,
  getEventsProducerSearch,
  saveEvent,
  uploadImage,
  getImageFile,
  updateEvent,
  changeStatusEvent,
  getNextEventsByCategory
}
