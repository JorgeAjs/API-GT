'use strict'
const mongoose = require('mongoose');
const Event = require('../models/event');
const Ticket = require('../models/ticket');
const User = require('../models/user');

/////* Events */////

/*
* Retorna el número de eventos existentes
* @method /api/statistics/NumOfEvents
* @return Json con el total
* @Author Francisco Moreno
*/

function getNumOfEvents(req,res)
{
  Event.find().count((err,totalEvents) =>
  {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`});
    res.status(200).send({totalEvents});
  });
};

/*
* Retorna el número de eventos activos
* @method /api/statistics/NumOfActiveEvents
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfActiveEvents(req,res){
  Event.find({"status":"Active"}).count((err, totalActiveEvents) =>
  {
		if (err) return res.status(500).send({message: 'Error al realizar la petición'});
		res.status(200).send({totalActiveEvents});
	});
};

/*
* Retorna el número de eventos de un productor
* @method /api/statistics/NumOfActiveEvents/:producerId
* @return Json con el total
* @Author Francisco Moreno/Jaime Beltran
*/
function getNumOfEventsByProducer(req,res){
  let producerId = req.params.producerId;
  Event.find({
    $and:
         [
          {"user":producerId},
          {"status":"Active"}
         ]
    }).count((err, totalActiveEvents) =>
  {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'});
    res.status(200).send({totalActiveEvents});
  });
};

/*
* Retorna el número de eventos que cumplen una o más de las categorías especificadas (un arreglo de objetos)
* @method /api/statistics/NumOfActiveEventsByCategory
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfActiveEventsByCategory(req,res){

  let categories = req.body.categories;

  if(!categories) return res.status(400).send({message: "No se recibieron categorías"}  );

  var myRegex = "(?=^" + categories.join("|") + "$)";

  Event.find({ category: new RegExp(myRegex) }).count((err, totalActiveEvents) =>
  {
    if (err) return res.status(500).send({message: 'Error al realizar la petición'});
    res.status(200).send({totalActiveEvents});
  });
};


/////* End Events */////

/////* Users */////

/*
* Retorna el número de usuarios existentes
* @method /api/statistics/NumOfUsers
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfUsers(req,res)
{
  User.find({"role":"USER"}).count((err,totalUsers) =>{

    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`});
    res.status(200).send({totalUsers});

  });
};

/*
* Retorna el número de usuarios activos en un rango específico de fechas
* @method /api/statistics/NumOfActiveUsersByDate
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfActiveUsersByDate(req,res){

  let dateFrom = new Date(req.body.dateFrom);
  let dateTo = new Date(req.body.dateTo);

  User.find({
    $and :
    [
      { "lastLogin": {$gte: dateFrom.toISOString(), $lte: dateTo.toISOString()} },
      {"role":"USER"}
    ]
      }).count((err,totalUsers) =>
  {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`});
    res.status(200).send({totalUsers});
  });
};

/////* End Users */////

/////* Producers */////

/*
* Retorna el número de productores
* @method /api/statistics/NumOfProducers
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfProducers(req,res)
{
  User.find({"role":"PRODUCER"}).count((err,totalProducers) =>{
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`});
    res.status(200).send({totalProducers});
  });
};

/////* End Producers */////

/////* Tickets */////
/*
* Retorna el número de tickets vendidos
* @method /api/statistics/NumOfTickets
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfTickets(req,res){
  Ticket.find({}).count((err,numOfTickets) => 
  {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});
    res.status(200).send({numOfTickets});
  });
};

/*
* Retorna el número de tickets vendidos por evento
* @method /api/statistics/NumOfTickets/:eventID
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfTicketsByEvent(req,res){
  let eventID = req.params.eventID;

  Ticket.find({"event":eventID}).count((err,numOfTickets) => 
  {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});
    res.status(200).send({numOfTickets});
  });
};

/*
* Retorna el los datos de un grafico que muestra el historial de tickets vendidos por dia, mes o dia de la 
* semana. la variable range debe ser 'day', 'month' o 'weekday' dependiendo del caso. Por defecto se retorna 
* historial por meses range='month'
* @method /api/statistics/SalesHistoryByEvent/:eventID/:range?
* @return Json con array de datos: Ex.              
* @Author Jaime
*/
function getSalesHistoryByEvent(req,res){
  let eventID = req.params.eventID;
  let range='month';

  if(req.params.range){
    range=req.params.range;
    if(range!='day' && range!='month' && range!='weekday'){
      range='month';
    }    
  }
  //Filter by month
  let filter={
    year:{$year:"$date"},
    month:{$month:"$date"}
  }
  let sortFilter={
    '_id.year':1,
    '_id.month':1
  }
  if(range=='day'){
    //Filter by day
    filter={
      year:{$year:"$date"},
      month:{$month:"$date"},
      day:{$dayOfMonth:"$date"}
    }
    sortFilter={
      '_id.year':1,
      '_id.month':1,
      '_id.day':1
    }
  }else if(range=='weekday'){
    //Filter by day of week
    filter={
      dayOfWeek:{$dayOfWeek:"$date"}
    }
    sortFilter={
      'numOfSales':1
    }
  }

  Ticket.aggregate(
    [
      {
        $match: {  "event" : mongoose.Types.ObjectId(eventID) }//Para aggregate es necesario hacer casting explícito!!
      },        
      {
        $group: {
          _id: filter,
          numOfSales: {$sum: 1}  
        }
      },
      { 
        $sort : sortFilter 
      }
    ]
  , function (err, result)
    {
        if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});

        res.status(200).send({result});
    }
  );
};

/*
* Retorna el número de tickets para un evento y localidad de  determinado
* @method /api/statistics/NumOfTickets/:eventID/section/:section
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfTicketsByStageLocation(req,res){

  let eventID = req.params.eventID;
  let stageLocationId = req.params.stageLocationId;

  Ticket.find({$and: [{"event":eventID}, {"stageLocation":stageLocationId}]}).count((err,numOfTickets) => 
  {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});
    res.status(200).send({numOfTickets});
  });
};

/*
* Retorna el número de tickets usados por evento
* @method /api/statistics/NumOfUsedTickets/:eventID
* @return Json con el total
* @Author Francisco Moreno
*/
function getNumOfUsedTicketsByEvent(req,res){
  let eventID = req.params.eventID;
  //console.log(eventID);
  Ticket.find({
    $and :
    [
      {"event":eventID},
      {"used":1}
    ]
  }).count((err,numOfUsedTickets) => 
    {
      if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});
      res.status(200).send({numOfUsedTickets});
    });
};

/*
* Retorna el porcentaje de tickets usados de un determinado evento
* @method /api/statistics/PercentageOfUsedTickets/:eventID
* @return Json con el total
* @Author Francisco Moreno
*/
function getPercentageUsedTickets(req,res){
  let eventID = req.params.eventID;

  Ticket.find({"event":eventID}).count((err,numOfTickets) => 
  {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});
    console.log(numOfTickets);
    Ticket.find({
      $and :
      [
        {"event":eventID},
        {"used":1}
      ]
    }).count((err,numOfUsedTickets) => 
      {
        if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});
        let percentage = numOfUsedTickets / numOfTickets * 100;
        res.status(200).send({percentage});
      }
    );
  });
};


/*
* Retorna las ventas totales
* @method /api/statistics/statistics/TotalSales
* @return Json con el total
* @Author Francisco Moreno
*/
function getTotalSales(req,res){
  Ticket.aggregate(
    {
        $group:
        {
          _id: null,
          total: {$sum: "$price"}
        }
    }
  , function (err, result)
    {
        if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});

        let total = 0;

        if (result.length)
          total = result[0].total;

        res.status(200).send({total});
    }
  );
};


/*
* Retorna las ventas para un evento determinado
* @method /api/statistics/statistics/TotalSales/:eventID
* @return Json con el total
* @Author Francisco Moreno
*/
function getSalesByEvent(req,res){
  let eventID = req.params.eventID;

  Ticket.aggregate(
    [
      {
        $match:
          {  "event" : mongoose.Types.ObjectId(eventID) }
      }         //Para aggregate es necesario hacer casting explícito!!
      ,{
        $group:
          {   
              _id: null,
              total: {$sum: "$price"}  
          }
       }
    ]
  , function (err, result)
      {
        if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`});

        let total = 0;

        if (result.length)
          total = result[0].total;

        res.status(200).send({total});
      }
  );
};

/*
* Retorna el evento más vendido de un productor determinado
* @method /api/statistics/NumOfTickets/:eventID/section/:section
* @return Json con el total y el número de tickets vendidos
* @Author Francisco Moreno
*/
function getMostSoldEvent(req,res){

  let producerID = req.params.producerID;

  Event.find(
    {
     $and:
         [
           {"user":producerID},
  				 {"status" : "Active"}
  			 ]
    }
    , function (err, events)
    {
      if (!events)
        return res.status(200).send({message:  "No hay eventos para el productor"});

      Ticket.aggregate(
        [
          {
            $match:
            {
              "event": {$in:
              events.map(  function(id) {return new mongoose.Types.ObjectId(id)} )  }
            }
          },
          { $group: { _id : "$event", total: {$sum: 1} } }
        ]
        ,function (err,soldTicketsByEvent)
        {
          soldTicketsByEvent.sort(function(a,b) {return b.total - a.total; });

          Event.findOne({"_id": soldTicketsByEvent[0]._id},
            function(err,theEvent)
            {
              return res.status(200).send({event: theEvent, ticketsSold: soldTicketsByEvent[0].total});
            });
        }
       );
    });
};

/*
* Retorna el número total de tickets por localidad
* @method /api/statistics/TotalsBySection
* @return Json con el arreglo de localidad (id) y número de tickets por localidad y número total de tickets
* @Author Francisco Moreno, modificado por Jaime Beltran
*/
function getTotalsBySection(req,res)
{
  let eventID = req.params.eventID;
  Ticket.aggregate([   
    {
        $match:
          {  "event" : mongoose.Types.ObjectId(eventID) }
    },
    { 
      $group: { _id : {stageLocation:"$stageLocation"}, total: {$sum: 1},totalSold: {$sum: "$price"} } 
    
    }
    ], function(err, totals) 
    {
      if (err) 
        return res.status(500).send({ message:`Error al realizar la petición ${err}`});
      
      let grandTotal = 0;
      let grandTotalSold = 0;

      totals.forEach(function(e) {
        grandTotal += e.total;
        grandTotal += e.totalSold;
      });

      return res.status(200).send({totalsBySection: totals, total: grandTotal});
    })
}

/////* End Tickets */////

module.exports = {
  getNumOfEvents,
  getNumOfActiveEvents,
  getNumOfEventsByProducer,
  getNumOfActiveEventsByCategory,
  getNumOfUsers,
  getNumOfActiveUsersByDate,
  getNumOfProducers,
  getNumOfTickets,
  getNumOfTicketsByEvent,
  getNumOfTicketsByStageLocation,
  getNumOfUsedTicketsByEvent,
  getPercentageUsedTickets,
  getTotalSales,
  getSalesByEvent,
  getMostSoldEvent,
  getSalesHistoryByEvent,
  getTotalsBySection
};
