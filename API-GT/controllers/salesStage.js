'use strict'
const SalesStage = require('../models/salesStage')
const config = require('../config')


/**
 * Obtiene el listado de todos las etapas
 * @method GET /salesStages/
 * @return Array de todos las etapas
 * @Author Jaime Beltran
 */
function getSalesStages (req, res) {
  let find = SalesStage.find({}).sort('from');
  find.exec((err,salesStages) =>{
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!salesStages) return res.status(404).send({message:`No existen etapas`})
     //console.log(events)
    res.status(200).send({salesStages})
  })
}


/**
 * Obtiene la información de una etapa de ventas dado su ID de BD
 * @method GET /salesStage/:salesStageId
 * @return Json con la información del la etapa
 * @Author Jaime Beltran
 */
function getSalesStage (req, res) {
  let locId = req.params.salesStageId
  SalesStage.findById(locId,(err, salesStage) => {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!salesStage) return res.status(404).send({message:`La etapa no existe`})

    res.status(200).send({salesStage:salesStage})
  })
}

/**
 * Inserta un nuevo documento en la Collection de SalesStages
 * @method POST /salesStage/'
 * @return Nuevo etapa
 * @Author Jaime Beltran
 */
function saveSalesStage (req,res) {
  //console.log('POST /api/event')
  //console.log(req.body)

  let salesStage = new SalesStage()
  salesStage.name = req.body.name
  salesStage.from = req.body.from
  salesStage.to = req.body.to
  salesStage.promotion = req.body.promotion
  salesStage.save((err,stageStored) => {
    if (err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    res.status(200).send({salesStage: stageStored})
  })
}

/**
 * Inserta un array de nuevos documento en la Collection de SalesStages
 * @method POST /salesStages/'
 * @return Array staylocations, numItems added
 * @Author Jaime Beltran
 */
function saveSalesStageArray (req,res) {
  //console.log('POST /api/event')
  //console.log(req.body)
  let docsArray=[];
  for (var key in req.body) {
    let doc=req.body[key]
    let salesStage = new SalesStage()
    salesStage.name = doc.name
    salesStage.from = doc.from
    salesStage.to = doc.to
    salesStage.promotion = doc.promotion
    docsArray.push(salesStage)
  };
  SalesStage.collection.insert(docsArray,(err,result) => {
    if (err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})
    if(!result) res.status(404).send({message: `No se pudo insertar los documentos`})
    res.status(200).send({result: result})
  })
}

/*
 * Actualiza la información de un usuario en la Collection User
 * @method PUT: /salesStage/:salesStageId
 * @return Json con el usuario actualizado
 * @Author Jaime Beltran
 */
function updateSalesStage(req, res){
  let stageId = req.params.salesStageId
  let update = req.body

  SalesStage.findByIdAndUpdate(stageId, { $set: update}, (err, stageUpdated) => {
    if (err) res.status(500).send({ messsage: `Error al actualizar la localidad ${err}`})

    if(!stageUpdated) res.status(404).send({message: `No se ha podido actualizar la etapa`})

    return res.status(200).send({ salesStage: stageUpdated})
  })
}

/*
 * Actualiza la información de un usuario en la Collection User
 * @method PUT: /salesStages/
 * @return Json con el usuario actualizado
 * @Author Jaime Beltran
 * No usar esta funcion, genera problemas debido a la respuesta asyncrona
 */
function updateSalesStageArray(req, res){

  var numOfDocs = req.body.length;
  function loopArray(i,until,onEnd)
  {
    if (i <= until)
    {
        let doc=req.body[i-1]
        let salesStageId=doc._id
        
        SalesStage.findByIdAndUpdate(salesStageId, { $set: doc}, (err, stageUpdated) => {
        if (err) 
          return res.status(500).send({ messsage: `Error al actualizar la etapa de ventas ${err}`})

        if(!stageUpdated) 
          return res.status(404).send({message: `No se ha podido actualizar la etapa`})

        loopArray(i+1,until,onEnd)
      })
    }
    else
      onEnd()
  }

  loopArray(1,numOfDocs,function() {return res.status(200).send({ result: numOfDocs+" items updated"})})

}

module.exports = {
  getSalesStages,
  getSalesStage,
  saveSalesStage,
  saveSalesStageArray,
  updateSalesStage,
  updateSalesStageArray
}