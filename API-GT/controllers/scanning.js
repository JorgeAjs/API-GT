'use strict'

const mongoose = require('mongoose');

const ScanningAuthorization = require('../models/scanningAuthorization')

const Ticket = require('../models/ticket');
const User = require('../models/user')

function verifyUser(req,res)
{
  let data = req.body;

  ScanningAuthorization.findOne({idNumber: data.idNumber, authorizationCode: data.authorizationCode},    
  function(err,authorization)
  {    
    if  (err) return res.status(500).send({error:`Error de base de datos`})    
      if(authorization)
        return res.status(200).send({   authorized: true   });
      else
        return res.status(404).send({   authorized: false   })
        
  });
}

function getTicketsWithIDNumber(req,res)
{   
  User.findOne({document: req.body.idNumber}, function(err,user)
  {
    if  (err) return res.status(500).send({error:`Error de base de datos`})
    if (user==null) return res.status(404).send();

    Ticket.find({user: user._id, used: false}).populate('user').populate('stageLocation').exec (function(err,tickets) {
      if (err) return res.status(500).send({error:`Error de base de datos`});

      return res.status(200).send(tickets);
    });
  });
}

function getTicket(req,res)
{  
  
  let data = req.body.qrData;
  data = data.split('-');
  
  if (data.length!=2)
    return res.status(404).send({ error: `Código inválido`});    

  let ticketId = data[0], code = data[1];  

  Ticket.findOne({_id:ticketId, encryptedCode:code, used: false}).populate('user').populate('stageLocation').exec(function(err,ticket){
    if (err) return res.status(500).send({ error: `Error de base de datos`});

    if(!ticket || ticket.encryptedCode != code) return res.status(404).send({ error: `Código inválido`}); 
    
    return res.status(200).send(ticket);        
  })   
}

function checkTicket(req,res)
{
  var ticket = req.body.ticket;
  
  Ticket.update({_id: ticket._id, used: false}, {$set: {used : true}},
    function(err,newTicket)
    {      
      if (err)
        return res.status(500).send({error: 'Error de base de datos'});
        else if (newTicket == null)
        res.status(200).send({error: 'El ticket ya fue escaneado'});
        else
          return res.status(200).send({});
    }
  )
}

module.exports = {
  verifyUser,
  getTicketsWithIDNumber,
  getTicket,
  checkTicket
} 