'use strinct'
const qr = require('../services/qr')

const Ticket = require('../models/ticket')
const config = require('../config')

 /*
 * Obtiene los datos de de un Ticket dado su ID
 * @method /api/app/ticket/:ticketId
 * @return Json con la información del ticket
 * 
 */
function getTicket(req,res){
  let ticketId = req.params.ticketId

  Ticket.findById(ticketId).populate([{path:'user'},{path:'stageLocation'},{path:'event',populate:{path:'venue',model:'Venue'}}]).exec((err,ticket) => {
    if (err) return res.status(500).send({ message: `Error al reaizar la petición ${err}`})
    if (!ticket) return res.status(404).send({ message: `El ticket no existe`})
    res.status(200).send({ticket})
  })
}



 /*
 * Obtiene los tickets de un usuario o evento paginados. Parametros enviados en el url ya sea como "eventId" o "userId".
 * Si no se envia parametro de evento o usuario envia la lista de todos los tickets. el parametro de pagina es "page"
 * @method /tickets/:userId?/e/:eventId?/p/:page?
 * @return Resultado
 * 
 */
function getTickets(req,res){
  let page=1;
  let userId=req.params.userId;
  let eventId=req.params.eventId;
  if(req.params.page){
    page=req.params.page;
  }
  let itemsPerPage=config.itemsPerPage;
  
  let find;
  if(userId){
    find = Ticket.find({user:userId}).sort('purchaseDate');
  }else if(eventId){
    find = Ticket.find({event:eventId}).sort('purchaseDate');
  }else{
    find = Ticket.find({}).sort('purchaseDate');
  }
  find.populate([
    {path:'user'},
    {path:'stageLocation'},
    {path:'event',populate:{path:'venue',model:'Venue'}}
    ]).paginate(page,itemsPerPage,(err,tickets, total) => {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`})
    if (!tickets) return res.status(404).send({ message:`No existen Tickets`})
    res.status(200).send({
          totalItems: total,
          tickets: tickets
        })
  });
}

 /*
 * Return an array of tickets sold
 * @method /tickets/sold/:eventId/:stageLocation?
 * @return tickets
 * 
 */
function getTicketsSold(req,res){
  let stageLocation;
  let eventId=req.params.eventId;
  if(req.params.stageLocation){
    stageLocation=req.params.stageLocation;
  }
  
  let find;
  if(stageLocation){
    find = Ticket.find({
      $and : [
         {"event" : eventId},
         //{"status" : 2},//ticket payed Se comenta porque esta funcion se utiliza para determinar cuales tickets estan disponibles y los tickets con estado pendiente estan en proceso
         {"stageLocation" : stageLocation}
      ]
    }).sort('purchaseDate')
  }else{
    find = Ticket.find({event:eventId}).sort('purchaseDate')
  }
  find.populate([
    {path:'user'},
    {path:'stageLocation'},
    {path:'event'}
    ]).exec((err,tickets) => {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`})
    if (!tickets) return res.status(404).send({ message:`No se encontraron Tickets`})
    res.status(200).send({
          tickets: tickets
        })
  });
}

 /*
 * Obtiene los tickets de un usuario en un rango de fecha-tiempo de evento determinado. 
 * Parametros enviados en el url como "userId", from,to.
 * Si no se envia parametro de usuario envia la lista de todos los tickets en el rago dado
 * @method /tickets/:from/:to/:userId?
 * @return Resultado
 * 
 */
function getTicketsInRange(req,res){
  let page=1;
  let userId=req.params.userId;
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
  if(userId){
    find = Ticket.find({user:userId}).sort('purchaseDate');
  }else{
    find = Ticket.find({}).sort('purchaseDate');
  }
  find.populate([
      {path:'user'},
      {path:'event',match: {
        date:{$gte:new Date(from),$lte:new Date(to)}
        }, populate:{path:'venue',model:'Venue'}}
    ]).exec((err,tickets) => {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`})
    if (!tickets) return res.status(404).send({ message:`No existen Tickets`})
    res.status(200).send({
          tickets: tickets
        })
  });
}


/*
 * Obtiene los tickets de un usuario y evento que se encuentran pendientes de información de pago. 
 * Parametros enviados en el url ya sea como "eventId" y "userId".
 * @method /tickets/unpayed/:userId/:eventId
 * @return Resultado
 * 
 */
function getUnpayedTickets(req,res){
  let userId=req.params.userId;
  let eventId=req.params.eventId;
  
  let find;
  find = Ticket.find({
      $and : [
         {"event" : eventId},
         {"paymentResponseId" : null},
         {"user" : userId}
      ]
    });
  find.populate([
    {path:'user'},
    {path:'stageLocation'},
    {path:'event',populate:{path:'venue',model:'Venue'}}
    ]).exec((err,tickets) => {
    if (err) return res.status(500).send({ message:`Error al realizar la petición ${err}`})
    if (!tickets) return res.status(404).send({ message:`No existen Tickets`})
    res.status(200).send({
          tickets: tickets
        })
  });
}

/*
 * Almacena un ticket en la collection de Ticket
 * @method /api/app/ticket/:ticketId ???
 * @return Resultado
 * 
 */
function saveTicket(req,res){
  console.log('POST /api/tickets')
  console.log(req.body)

  let ticket = new Ticket()
  ticket.section = req.body.section
  ticket.row = req.body.row
  ticket.seat = req.body.seat
  ticket.price = req.body.price
  ticket.charge = req.body.charge
  ticket.subtotal = req.body.subtotal
  ticket.total = req.body.total
  ticket.stageLocation = req.body.stageLocation
  ticket.date = new Date().toISOString() //SE agrego este campo, para saber la fecha en la que se crea el ticket.
  //ticket.purchaseDate = new Date(req.body.purchaseDate).toISOString() Considero que este campo se debe guardar unicamente cuando se compra el tickete, es decir en el metodo de update
  //ticket.encryptCode = '' (creo que este codigo debe crearse aca!! - preguntar a Carlos)
  ticket.used = false
  ticket.event = req.body.event
  ticket.user = req.body.user
  ticket.save((err, ticketStored) => {
    if (err) res.status(500).send({ message: `Error al salvar en la base de datos ${err}`})
    res.status(200).send({ ticket: ticketStored })
  })
}
/*
 * Actualiza la información  un ticket en la collection de Ticket
 * @method /api/app/ticket/:ticketId ???
 * @return Resultado
 * 
 */
function updateTicket(req,res){
  let ticketId = req.params.ticketId
  let update = req.body
  Ticket.findByIdAndUpdate(ticketId,{$set:update},(err,ticketUpdated) => {
    if (err) res.status(500).send({ messsage: `Error al actualizar el ticket ${err}`})

    res.status(200).send({ ticket:ticketUpdated })
  })
}

function deleteTicket(req,res){
  let ticketId = req.params.ticketId

  Ticket.findById(ticketId, (err,ticket) => {
    if (err) res.status(500).send({ message: `Error al borrar el ticket ${err}`})

    ticket.remove( err => {
      if (err) res.status(500).send({ message: `Error al borrar el ticket ${err}`})

      res.status(200).send({ message: `El ticket ha sido eliminado`})
    })
  })
}


/*
 * Actualiza el ticket escaneado desde la aplicación
 * @method /api/ticket/check
 * @return mensaje (e información de usuario)
 * 
 */
function checkTicket(req,res){
  
  let data = req.body.data;
  data = data.split('-');

  if (data.length!=2)
    return res.status(200).send({ message: `Código inválido`});  

  let ticketId = data[0], code = data[1];

  console.log('Tried to scan ticket:' + ticketId);

  Ticket.findById(ticketId).populate('user').exec(function(err,ticket){
    if (err) return res.status(200).send({ message: `Error de base de datos`});

    if(!ticket || ticket.encryptedCode != code) return res.status(200).send({ message: `Código inválido`}); 

    if(ticket.used)
      return res.status(200).send({ message: `El ticket ya fue escaneado`});

    Ticket.update({ _id: ticketId }, { $set: { used: true }}, (err) => {
    if (err)
      return res.status(200).send({ message: `Error de base de datos`})
    return res.status(200).send({ message: `Ticket registrado`, name:ticket.user.name, document: ticket.user.document})
    });    
  })   
}


/*
 * Retorna la imagen (png) del código QR
 * @method /api/ticket/qr/:ticketID
 * @return archivo de imagen
 * 
 */
function getTicketQR(req,res){
  
  let ticketID = req.params.ticketID;
  Ticket.findById(ticketID,function(err,ticket)
  {
    if (err) res.status(500).send({ message: `Error de base de datos ${err}`});

    let qrImage = qr.generateQRimage(qr.getQRdata(ticket));
    res.attachment('qr.png');
    qrImage.pipe(res);

  });
  
}

module.exports = {
  getTicket,
  getTickets,
  getTicketsInRange,
  saveTicket,
  updateTicket,
  deleteTicket,
  getTicketsSold,
  checkTicket,
  getUnpayedTickets,
  getTicketQR
}


