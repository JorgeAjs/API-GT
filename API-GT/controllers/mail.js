'use strict'
const config = require('../config')

//send mail
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');


// Create the transporter with the required configuration for Hotmail
const transporter = nodemailer.createTransport(smtpTransport({
	//service: config.mailService, //Hotmail, Gmail, etc
	host: 'smtp.zoho.com',
	port: 465,
	secure: true, // use SSL
   	auth: {
       user: config.mailUser,
       pass: config.mailPassword
   }
}));

/**
 * Envia un email usando los parametros de configuracion de config.js. Los parametros son enviados
 * por POST y deben contener los datos de subject, to, y message. message puede tener contenido HTML
 * @return Si se envio el mensaje con exito retorna las opciones de email y el mensaje de respuesta del
 * servidor de correo
 */
function sendMail(req,res,next){
	if(!req.body.subject
  		|| !req.body.message
  		|| !req.body.to){
  		return res.status(404).send({message:"Error: Mail data not sended"})
  	}
	let subject = req.body.subject
  	let message = req.body.message
  	let to =req.body.to
	let mailOptions = {
	    from: config.mail, // sender address (who sends). must be the same as user for gmail and hotmail
	    to: to, // list of receivers (who receives)
	    subject: subject, // Subject line
	    html: message // html body
	}

	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	    	console.log(error)
	    	return res.status(404).send({message:"Error: "+error.response})	     
	    }
	    //console.log('Message sent: ' + info.response)
	    res.status(200).send({mail: mailOptions,message:info.response})
	});
}

//Careful with attachments. Each one is an object with filename and content.
function sendMailHTML(to,subject,html,attachments)
{
	let mailOptions;
	if(attachments!=null){
		mailOptions = {
	    	from: config.mail, 
	    	to: to, 
	    	subject: subject, 
	    	html: html,
			attachments: attachments}
	}else{
		mailOptions = {
	    	from: config.mail, 
	    	to: to, 
	    	subject: subject, 
	    	html: html}
	}

	transporter.sendMail(mailOptions, function(error, info){
	    if(error) console.log(error);
	});
}

module.exports = {
  sendMail,
  sendMailHTML
}