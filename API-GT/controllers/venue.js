'use strict'
const Venue = require('../models/venue')

/*
 * Obtiene todos los Escenarios
 * @method /api/venues'
 * @return Json con el listado de los Escenarios
 */
function getVenues (req, res){
    let find = Venue.find({}).sort('stage');
    find.populate({path:'stageLocations'}).exec((err,venues) =>{
      if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
      if (!venues) return res.status(404).send({message:`No existen ubicaciones`})
       //console.log(events)
      res.status(200).send({venues:venues})
    })
}

/*
 * Obtiene un escenario dado su ID
 * @method /api/venue/:venueId'
 * @return un escenario 
 */

function getVenueById(req, res){
    let venueId = req.params.venueId
    Venue.findById(venueId).populate({path:'stageLocations'}).exec(function (err, venue) {
		if (err) return res.status(500).send({message: 'Error al realizar la petición'})
		if (!venue) return res.status(404).send({message: 'No existen Productos'})
		res.status(200).send({venue})
	})
}

/**
 * Retorna la imagen enviada de la carpeta de imagenes de eventos
 * @method PUT /api/eventImage/:imageFile'
 * @return Archivo de imagen
 */
function getImageFile(req,res){
  var imageFile = req.params.imageFile;
  var file_path=config.venueImagePath+'/'+imageFile;
  
  fs.exists(file_path,function(exists){
    if(exists){
      res.sendFile(path.resolve(file_path));
    }else{
      res.status(200).send({message:"Image not found"});
    }
  });
}

module.exports = {
  getVenues,
  getVenueById,
  getImageFile
}