'use strict'
const md5 = require('md5');
const Moment = require('moment')
const crypto = require('crypto');

const qr = require('../services/qr')
const config = require('../config')
const Templating = require('../services/templating')
const Mailer = require('../controllers/mail')

const Counter = require('../models/counter')
const Ticket = require('../models/ticket')
const User = require('../models/user')
const Venue = require('../models/venue')
const EpaycoResponse = require ('../models/epaycoResponse')

function getNewId(callback)
{
    function yyyymmdd(date) {
      var mm = (date.getMonth() + 1).toString();
      var dd = date.getDate().toString();

      return [date.getFullYear(), mm.length===2 ? '' : '0', mm, dd.length===2 ? '' : '0', dd].join('');
    }

    function padNumber(number,length)
    {        
        let result = number.toString();

        for (var i=0 ; i<(length-number.toString().length) ; i++)        
            result = "0" + result;
        
        return result;
    }

    Counter.findOne({name:'invoices'},function (err,counter) {

        let lastUpdated, currentDate = new Date();
        currentDate.setHours(0,0,0,0);        
        
        if(counter != null)
        {            
            lastUpdated = counter.lastUpdated;
            lastUpdated.setHours(0,0,0,0);
        }

        if(currentDate > lastUpdated && counter != null )
        {            
            Counter.findOneAndUpdate(
                    {  name:"invoices"  },{ $set:{ currentValue:0, lastUpdated: new Date()}  },
                    {  new: true  }
                        ,function(err,counter)
                {
                    let paddedEnd = padNumber(counter.currentValue,6);

                    let newId = config.idPrefix + yyyymmdd(currentDate) + paddedEnd;
                    callback(err,newId);
                    return;
                })
        }

        else
        {
            Counter.findOneAndUpdate(
                    {  name:"invoices"  },{  $inc:{ currentValue : 1 }, $set:{ lastUpdated: new Date()}  },
                    {  upsert: true, new: true  }
                        ,function(err,counter)
                {   
                    if(err) {callback(err,{}); return;};
                    let paddedEnd = padNumber(counter.currentValue-1,6);

                    let newId = config.idPrefix + yyyymmdd(currentDate) + paddedEnd;
                    callback(err,newId);
                    return;
                })
        }
    })    
}

function getEncryptedCodes(tickets, callback)
{
    let codes = [];    

    function loopTickets(i,until)
    {
        if (i<until)
        {
            let ticketId = tickets[i]._id;

            Ticket.findById(ticketId).populate('user').populate('event').exec( function (err,ticket) 
                {           
                    if(err)  {callback(err,{}); return;};

                    if(!ticket)                       
                        callback(new Error('El ticket no existe'),{});
                    
                    else
                    {
                        var information = [];                        
                        information.push(ticket.user._id);
                        information.push(ticket.user.document);
                        information.push (ticket.event._id);
                        information.push (ticket.event.user);
                        information.push(ticket.event.date);                        
                        information.push(ticket.date.getTime());
                        
                        let md5_string = md5(information.join('&'));
                        codes.push(md5_string);
                        loopTickets(i+1,until)
                    }
                })     
        }
        else
        {
            var err;
            callback(err,codes);
        }
    }

    loopTickets(0,tickets.length)    
}


function getQRBase64(ticket,callback)
{
    let stringQR = qr.getQRdata(ticket);
    let qrStream = qr.generateQRimage(stringQR);
    
    let buffers = [];

    qrStream.on('error', (err) => {callback(err,{}); return;});
    qrStream.on('data', (data) => buffers.push(data));
    qrStream.on('end', () => {callback(null,Buffer.concat(buffers).toString('base64'));});
}

function sendTicketsByMail(to,idInvoice)
{    
    Ticket.find({idInvoice: idInvoice}).populate('event').populate('user').populate('stageLocation').exec(function(err,tickets)
    {    
        if(err) {console.log("payment/sendTicketsByMail "+err); return;}        
        
        function loopTickets(i,until)
        {            
            let ticket = tickets[i];
            if(i<until)
            { 
                User.findById(tickets[i].event.user,function(err,producer)
                {
                    if(err) {console.log("payment/sendTicketsByMail "+err); return;}
                    Venue.findById(tickets[i].event.venue,function(err,venue)
                    {
                        if(err) {console.log("payment/sendTicketsByMail "+err); return;}
                        
                        let parameters = [];
                        let theDate = Moment(ticket.event.date);
                        theDate.locale('es');
                        parameters.push({placeholder:"###DATE###",value:theDate.format('LLL')});
                        parameters.push({placeholder:"###TITLE###",value:ticket.event.title});
                        parameters.push({placeholder:"###SEAT###",value:ticket.seat});
                        parameters.push({placeholder:"###SEAT###",value:ticket.seat}); //Replace 2 ocurrences!!
                        parameters.push({placeholder:"###TITLE###",value:ticket.event.title});
                        parameters.push({placeholder:"###NAME###",value:ticket.user.name});
                        parameters.push({placeholder:"###VENUE###",value:venue.stage});
                        parameters.push({placeholder:"###ADDRESS###",value:venue.address});
                        parameters.push({placeholder:"###CITY###",value:venue.city});
                        parameters.push({placeholder:"###MAINARTIST###",value:ticket.event.mainArtist});
                        parameters.push({placeholder:"###OTHERARTISTS###",value:ticket.event.otherArtists});
                        parameters.push({placeholder:"###ORGANIZER###",value:producer.name});
                        parameters.push({placeholder:"###NIT###",value:producer.nit});
                        parameters.push({placeholder:"###SECTION###",value:ticket.stageLocation.name});
                        parameters.push({placeholder:"###EVENTPRICE###",value:ticket.price});
                        parameters.push({placeholder:"###ADMINCOSTS###",value:ticket.charge});
                        parameters.push({placeholder:"###TOTAL###",value:ticket.total});
                        
                        getQRBase64(ticket,function(err,qrBase64) {                            

                            if(err) {console.log("payment/sendTicketsByMail "+err); return;};                            

                            Templating.fillTemplate(parameters,"./mail_templates/ticket.html",function(err,mailHTML)
                            {
                                let attachments = [];
                                attachments.push({filename: 'qr.png', content:qrBase64, encoding:'base64', cid:'qrimage'});
                                attachments.push({filename:ticket._id.toString()+'.pdf', content: qr.generateQRpdf(qr.getQRdata(ticket)) });

                                Mailer.sendMailHTML(ticket.user.email,"Ticket - "+ticket.event.title,mailHTML,attachments);
                                loopTickets(i+1,until);
                            });

                        });
                    });
                });
            }
            else return;
        }

        loopTickets(0,tickets.length);

    });
}

function getEpaycoConfirmationSignature(epaycoResponse)
{
    let signature = [];

    signature.push(config.customerIdEpayco);
    signature.push(config.pKeyEpayco);
    signature.push(epaycoResponse.x_ref_payco);
    signature.push(epaycoResponse.x_transaction_id);
    signature.push(epaycoResponse.x_amount_ok);
    signature.push(epaycoResponse.x_currency_code);

    signature = signature.join('^');

    return crypto.createHash('sha256').update(signature).digest('hex');

}

/*
 * Recibe la respuesta de epayco y envía el email con los tiquetes asociados al pago
 * @method /api/payment/epayco
 * @return -
 */
function processEpaycoResponse(req,res)
{
    let epaycoResponse = new EpaycoResponse();

    epaycoResponse.x_cust_id_cliente=req.body.x_cust_id_cliente;
    epaycoResponse.x_description=req.body.x_description;
    epaycoResponse.x_amount_ok=req.body.x_amount_ok;
    epaycoResponse.x_id_invoice=req.body.x_id_invoice,
    epaycoResponse.x_amount_base=req.body.x_amount_base;
    epaycoResponse.x_tax=req.body.x_tax;
    epaycoResponse.x_currency_code=req.body.x_currency_code;
    epaycoResponse.x_franchise=req.body.x_franchise;
    //La fecha de epayco viene en formato 2017-06-20 17:42:37
    let dateformated=req.body.x_transaction_date;
    //se debe verificar la zona local de tiempo
    dateformated=dateformated.replace(" ","T")+".000Z";
    epaycoResponse.x_transaction_date=req.body.x_transaction_date;
    epaycoResponse.x_approval_code=req.body.x_approval_code;
    epaycoResponse.x_transaction_id=req.body.x_transaction_id;
    epaycoResponse.x_ref_payco=req.body.x_ref_payco;
    epaycoResponse.x_cod_response=req.body.x_cod_response;
    epaycoResponse.x_signature=req.body.x_signature;
    epaycoResponse.x_response=req.body.x_response;
    epaycoResponse.x_response_reason_text=req.body.x_response_reason_text;
    epaycoResponse.x_extra1=req.body.x_extra1;
    epaycoResponse.x_extra2=req.body.x_extra2;
    epaycoResponse.x_extra3=req.body.x_extra3;
    epaycoResponse.x_customer_doctype=req.body.x_customer_doctype;
    epaycoResponse.x_customer_document=req.body.x_customer_document;
    epaycoResponse.x_customer_name=req.body.x_customer_name;
    epaycoResponse.x_customer_lastname=req.body.x_customer_lastname;
    epaycoResponse.x_customer_email=req.body.x_customer_email;
    epaycoResponse.x_customer_phone=req.body.x_customer_phone;
    epaycoResponse.x_customer_country=req.body.x_customer_country;
    epaycoResponse.x_customer_city=req.body.x_customer_city;
    epaycoResponse.x_customer_address=req.body.x_customer_address;
    epaycoResponse.x_customer_ip=req.body.x_customer_ip;

    epaycoResponse.save((err,newEpayco) =>
    {
        if (newEpayco.x_cod_response == '1')
        {          
            Ticket.find({idInvoice: newEpayco.x_id_invoice},function(err,tickets)
            {
                getEncryptedCodes(tickets,function(err,codes)
                {                    
                    function loopArray(i,until)
                    {
                        if (i < until)
                        {
                            let ticket=tickets[i];                      
                            
                            //Check information integrity to avoid fraud
                            if(getEpaycoConfirmationSignature(epaycoResponse) != epaycoResponse.x_signature)                             
                            { 
                                console.log("Signature mismatch for ticket:" + ticket._id);
                                return;
                            }

                            Ticket.findByIdAndUpdate(ticket._id, 
                            { $set: {  encryptedCode: codes[i], paymentResponseId: newEpayco._id , purchaseDate: new Date(), status: 2 } }
                            ,(err, ticketUpdated) => 
                            {
                                if (err) {console.log("Error: payment/processEpaycoResponse:" + err); return;};

                                loopArray(i+1,until);
                            })
                        }
                        else
                            sendTicketsByMail(newEpayco.x_customer_email,newEpayco.x_id_invoice);
                    }                    
                    loopArray(0,tickets.length)
                })                
            })
        }else if (newEpayco.x_cod_response == '3' && getEpaycoConfirmationSignature(epaycoResponse) == epaycoResponse.x_signature )
        {
            Ticket.update({idInvoice: newEpayco.x_id_invoice},{ $set: {  paymentResponseId: newEpayco._id , status: 3 } },
                ()=> {return;});            
        }
    })
}

/*
 * Primera etapa de pago. Crea objeto en blanco de tiquete y factura asociada.
 * @method /api/payment
 * @return Json con el objeto de tiquete
 */
function processPayment(req,res)
{    
    getNewId(function (err,newId)
    {
        if (err) res.status(500).send({ messsage: "Error de base de datos" });

        let ticket = Ticket();

        ticket.charge = req.body.charge;
        ticket.date = new Date().toISOString();
        ticket.event = req.body.event;
        ticket.idInvoice = newId;
        ticket.price = req.body.price;
        ticket.row = req.body.row;
        ticket.seat = req.body.seat;     
        ticket.section = req.body.section;        
        ticket.status = 1;
        ticket.subtotal = req.body.subtotal;
        ticket.total = req.body.total;    
        ticket.used = false;        
        ticket.user = req.body.user;
        ticket.stageLocation = req.body.stageLocation

        var signature = [];  
                      
        signature.push(config.customerIdEpayco);
        signature.push(config.pKeyEpayco);
        signature.push (newId);
        signature.push (ticket.total);
        signature.push('COP');                        
        let md5_signature = md5(signature.join('^'));        

        ticket.save((err, newTicket) => {
            if (err) return res.status(500).send({ message: `Error de base de datos`})
            return res.status(200).send({ ticket:newTicket,signature:md5_signature })
        })
    });
}

/*
 * Obtiene la información de una respuesta de epayco
 * @method /api/payment/epaycoResponse/:idPayment
 * @return Json con la información del evento
 */
function getEpaycoResponse (req, res) {
  let id = req.params.idPayment
  EpaycoResponse.findById(id,(err, response) => {
    if  (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
    if (!response) return res.status(404).send({message:`El objeto no existe`})

    res.status(200).send({epaycoResponse:response})
  })
}

module.exports = {
  processEpaycoResponse,
  processPayment,
  getEpaycoResponse
}
