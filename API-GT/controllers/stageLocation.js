'use strict'
const StageLocation = require('../models/stageLocation')
const config = require('../config')


/**
 * Obtiene el listado de todos las locaciones
 * @method GET /stageLocations/
 * @return Array de todos los eventos
 * @Author Jaime Beltran
 */
function getStageLocations (req, res) {
  let find = StageLocation.find({}).sort('name');
  find.exec((err,stageLocations) =>{
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!stageLocations) return res.status(404).send({message:`No existen locaciones`})
     //console.log(events)
    res.status(200).send({stageLocations})
  })
}


/**
 * Obtiene la información de un evento dado su ID de BD
 * @method GET /stageLocation/:stageId
 * @return Json con la información del stage
 * @Author Jaime Beltran
 */
function getStageLocation (req, res) {
  let locId = req.params.stageLocationId
  StageLocation.findById(locId,(err, stageLocation) => {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!stageLocation) return res.status(404).send({message:`La locacion no existe`})

    res.status(200).send({stageLocation:stageLocation})
  })
}

/**
 * Inserta un nuevo documento en la Collection de StageLocations
 * @method POST /stageLocation/'
 * @return Nuevo stage
 * @Author Jaime Beltran
 */
function saveStageLocation (req,res) {
  //console.log('POST /api/event')
  //console.log(req.body)

  let stageLocation = new StageLocation()
  stageLocation.name = req.body.name
  stageLocation.capacity = req.body.capacity
  stageLocation.startNumber = req.body.startNumber
  stageLocation.endNumber =req.body.endNumber
  stageLocation.prefix = req.body.prefix
  stageLocation.sufix = req.body.sufix
  stageLocation.svgId = req.body.svgId
  stageLocation.chairLocation = req.body.chairLocation
  stageLocation.save((err,stageStored) => {
    if (err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    res.status(200).send({stageLocation: stageStored})
  })
}

/**
 * Inserta un array de nuevos documento en la Collection de StageLocations
 * @method POST /stageLocations/'
 * @return Array staylocations, numItems added
 * @Author Jaime Beltran
 */
function saveStageLocationArray (req,res) {
  //console.log('POST /api/event')
  //console.log(req.body)
  let docsArray=[];
  for (var key in req.body) {
    let doc=req.body[key]
    let stageLocation = new StageLocation()
    stageLocation.name = doc.name
    stageLocation.capacity = doc.capacity
    stageLocation.startNumber = doc.startNumber
    stageLocation.endNumber = doc.endNumber
    stageLocation.prefix = doc.prefix
    stageLocation.sufix = doc.sufix
    stageLocation.svgId = doc.svgId
    stageLocation.chairLocation = req.body.chairLocation
    docsArray.push(stageLocation)
  };
  StageLocation.collection.insert(docsArray,(err,result) => {
    if (err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    if(!result) res.status(404).send({message: `No se pudo insertar los documentos`})
    res.status(200).send({result: result})
  })
}

/*
 * Actualiza la información de un usuario en la Collection User
 * @method PUT: /stageLocation/:stageId
 * @return Json con el usuario actualizado
 * @Author Jaime Beltran
 */
function updateStageLocation(req, res){
  let stageId = req.params.stageId
  let update = req.body

  User.findByIdAndUpdate(stageId, { $set: update}, (err, stageUpdated) => {
    if (err) res.status(500).send({ messsage: `Error al actualizar la localidad ${err}`})

    if(!stageUpdated) res.status(404).send({message: `No se ha podido actualizar la localidad`})

    return res.status(200).send({ stageLocation: stageUpdated})
  })
}

module.exports = {
  getStageLocations,
  getStageLocation,
  saveStageLocation,
  saveStageLocationArray,
  updateStageLocation
}