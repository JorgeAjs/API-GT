'use strict'

const express = require('express')
const config = require('../config')
const StageLocationsController = require('../controllers/stageLocation')
const SalesStageController = require('../controllers/salesStage')
const VenueController = require('../controllers/venue')
const EventController = require('../controllers/event')
const EventPriceController = require('../controllers/eventPrice')
const UserController = require('../controllers/user')
const TicketController = require('../controllers/ticket')
const PaymentController = require('../controllers/payment')
const Mail = require('../controllers/mail')
const Scanning = require('../controllers/scanning')

const md_auth = require('../middlewares/authenticated')
const Statistics = require ('../controllers/statistics')

const api = express.Router()

//upload images middleware
const multer  = require('multer')


const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, config.eventImagePath)
	},
	filename: function (req, file, cb) {
		console.log(file)
	  let ext='jpg'
	  if(file.mimetype='image/jpeg'){
	  	ext='jpg'
	  }else if(file.mimetype='image/png'){
	  	ext='png'
	  }else if(file.mimetype='image/gif'){
	  	ext='gif'
	  }
	  cb(null, file.fieldname+Date.now() +'.'+ext) 
	}
})
const upload = multer({storage: storage})

/* EVENTOS - Consultas*/
api.get('/events/:page?', EventController.getEvents)
api.get('/event/:eventId', EventController.getEvent)
api.get('/nextEvent', EventController.getNextEvent)
api.get('/events/promoted/:page?', EventController.getEventsPromoted)
api.get('/events/active/:page?', EventController.getEventsActive)
api.get('/events/category/:type/:page?', EventController.getEventsbyType)
api.get('/events/soon/:datevent/:page?', EventController.getEventsSoon)
api.get('/events/search/:text/:page?', EventController.getEventsSearch)
api.get('/events/dates/:from/:to/:userId?/:page?', EventController.getEventsInRange)
api.get('/events/producer/:userId/:page?', md_auth.ensureAuth, EventController.getEventsProducer)
api.get('/events/producer/active/:userId/:page?', md_auth.ensureAuth, EventController.getEventsProducerActive)
api.get('/events/producer/soon/:userId/:datevent/:page?', md_auth.ensureAuth, EventController.getEventsProducerSoon)
api.get('/events/producer/search/:userId/:text/:page?', md_auth.ensureAuth, EventController.getEventsProducerSearch)
api.get('/eventImage/:imageFile', EventController.getImageFile)
api.get('/events/nextEvents/:category/:page?',EventController.getNextEventsByCategory)
/*EVENTOS - Almacenar*/

api.post('/uploadImageEvent/:eventId', md_auth.ensureAuth ,upload.single('picture'),EventController.uploadImage)
api.post('/event', md_auth.ensureAuth ,EventController.saveEvent)

/*EVENTOS - Actualizar*/
api.put('/event/:eventId', md_auth.ensureAuth, EventController.updateEvent)
api.put('/event/status/:eventId/:newstatus', md_auth.ensureAuth, EventController.changeStatusEvent)

/*STAGELOCATIONS - Consultas*/
api.get('/stageLocation/:stageId', StageLocationsController.getStageLocation)
api.get('/stageLocations', md_auth.ensureAuth, StageLocationsController.getStageLocations)

/*STAGELOCATIONS - Almacenar*/
api.post('/stageLocation/',md_auth.ensureAuth, StageLocationsController.saveStageLocation)
api.post('/stageLocations/',md_auth.ensureAuth, StageLocationsController.saveStageLocationArray)

/*STAGELOCATIONS - Actualizar*/
api.put('/stageLocation/:stageId',md_auth.ensureAuth, StageLocationsController.updateStageLocation)

/*STAGELOCATIONS - Consultas*/
api.get('/salesStage/:salesStageId', SalesStageController.getSalesStage)

/*STAGELOCATIONS - Almacenar*/
api.post('/salesStage/',md_auth.ensureAuth, SalesStageController.saveSalesStage)
api.post('/salesStages/',md_auth.ensureAuth, SalesStageController.saveSalesStageArray)

/*STAGELOCATIONS - Actualizar*/
api.put('/salesStage/:salesStageId',md_auth.ensureAuth, SalesStageController.updateSalesStage)
api.put('/salesStages/',md_auth.ensureAuth, SalesStageController.updateSalesStageArray)

/*STAGELOCATIONS - Consultas*/
api.get('/eventPrice/:eventPriceId', EventPriceController.getEventPrice)
api.get('/eventPrices/:eventId/:salesStage?', EventPriceController.getEventPrices)

/*STAGELOCATIONS - Almacenar*/
api.post('/eventPrice/',md_auth.ensureAuth, EventPriceController.saveEventPrice)
api.post('/eventPrices/',md_auth.ensureAuth, EventPriceController.saveEventPriceArray)

/*STAGELOCATIONS - Actualizar*/
api.put('/eventPrice/:eventPriceId',md_auth.ensureAuth, EventPriceController.updateEventPrice)
api.put('/eventPrices/',md_auth.ensureAuth, EventPriceController.updateEventPriceArray)


/*PROMOTORES Consultas*/
api.get('/producers/:page', UserController.getProducers)
api.get('/producer/:producerId', UserController.getProducer)

/*ProducerES Almacenar*/
api.post('/producers/', UserController.saveProducer)
api.post('/registerProducer/', UserController.registerProducer)
/*ProducerES actualizar*/
api.put('/producers/:producerId', UserController.updateProducer)
api.put('/producers/activate/:producerId', md_auth.ensureAuth ,UserController.activateProducer)
api.put('/producers/deactivate/:producerId', md_auth.ensureAuth, UserController.deactivateProducer)

/*Venues consultas*/
api.get('/venues', VenueController.getVenues)
api.get('/venues/:venueId', VenueController.getVenueById)
api.get('/venueImage/:imageFile', VenueController.getImageFile)

/* USERS - Consultas*/
api.get('/users/:page?',md_auth.ensureAuth, UserController.getUsers)
api.get('/user/:userId', UserController.getUser)
/* USERS - Almacenar*/
api.post('/users/', md_auth.ensureAuth, UserController.saveUser)
api.post('/registerUser/', UserController.registerUser)

/* USERS - Actualizar*/
api.put('/user/activate/:userId', UserController.activateUser)
api.put('/users/updatePassword/:userId',md_auth.ensureAuth, UserController.updateUserPassword)

api.post('/users/requestForgottenPasswordChange', UserController.processForgottenPasswordRequest)
api.post('/users/changeForgottenPassword', UserController.changeForgottenPassword)

/*USERS - login*/
api.post('/users/login', UserController.loginUser)

/*USERS - userExists*/
api.post('/users/userExists', UserController.userExists)

/*Tickets - Consultas*/
api.get('/tickets/:userId?/e/:eventId?/p/:page?',md_auth.ensureAuth, TicketController.getTickets)
api.get('/tickets/sold/:eventId/:stageLocation?',md_auth.ensureAuth, TicketController.getTickets)
api.get('/tickets/:from/:to/:userId?',md_auth.ensureAuth, TicketController.getTicketsInRange)
api.get('/ticket/:ticketId',md_auth.ensureAuth, TicketController.getTicket)
api.get('/ticket/unpayed/:userId/:eventId',md_auth.ensureAuth, TicketController.getUnpayedTickets)

/*Tickets - Almacenar*/
api.post('/tickets/',md_auth.ensureAuth, TicketController.saveTicket)
/*Tickets - Actualizar*/
api.put('/tickets/:ticketId',md_auth.ensureAuth, TicketController.updateTicket)
api.post('/ticket/check',TicketController.checkTicket)

/*QR*/
api.get('/ticket/qr/:ticketID',md_auth.ensureAuth,TicketController.getTicketQR)

/*Estadísticas */
/* Eventos */
api.get('/statistics/NumOfEvents', Statistics.getNumOfEvents)
api.get('/statistics/NumOfActiveEvents', Statistics.getNumOfActiveEvents)
api.get('/statistics/NumOfEventsByProducer/:producerID', md_auth.ensureAuth, Statistics.getNumOfEventsByProducer)
api.post('/statistics/NumOfActiveEventsByCategory', Statistics.getNumOfActiveEventsByCategory)

/* Usuarios */
api.get('/statistics/NumOfUsers', md_auth.ensureAuth, Statistics.getNumOfUsers)
api.post('/statistics/NumOfActiveUsersByDate', md_auth.ensureAuth ,Statistics.getNumOfActiveUsersByDate)

/* Productores */
api.get('/statistics/NumOfProducers', md_auth.ensureAuth ,Statistics.getNumOfProducers)

/* Tickets */
api.get('/statistics/NumOfTickets', md_auth.ensureAuth ,Statistics.getNumOfTickets)
api.get('/statistics/NumOfTickets/:eventID', md_auth.ensureAuth ,Statistics.getNumOfTicketsByEvent)
api.get('/statistics/SalesHistory/:eventID/:range?', md_auth.ensureAuth ,Statistics.getSalesHistoryByEvent)
api.get('/statistics/NumOfTickets/:eventID/stageLocation/:stageLocationId', md_auth.ensureAuth ,Statistics.getNumOfTicketsByStageLocation)
api.get('/statistics/NumOfUsedTickets/:eventID', md_auth.ensureAuth ,Statistics.getNumOfUsedTicketsByEvent)
api.get('/statistics/PercentageOfUsedTickets/:eventID', md_auth.ensureAuth, Statistics.getPercentageUsedTickets)
api.get('/statistics/TotalSales', md_auth.ensureAuth, Statistics.getTotalSales)
api.get('/statistics/TotalSales/:eventID', md_auth.ensureAuth, Statistics.getSalesByEvent)
api.get('/statistics/MostSoldEvent/:producerID', md_auth.ensureAuth, Statistics.getMostSoldEvent)
api.get('/statistics/TotalsBySection/:eventID', md_auth.ensureAuth, Statistics.getTotalsBySection)
/* Fin estadísticas*/

/*Pagos*/
api.post('/payment/epayco',PaymentController.processEpaycoResponse)
api.post('/payment', md_auth.ensureAuth, PaymentController.processPayment)

api.get('/payment/epaycoResponse/:idPayment',md_auth.ensureAuth,PaymentController.getEpaycoResponse)

//send mail
api.post('/sendmail', Mail.sendMail)

/* App verificación*/
api.post('/scanning/verifyUser', Scanning.verifyUser)
api.post('/scanning/getTickets', Scanning.getTicketsWithIDNumber)
api.post('/scanning/getTicket', Scanning.getTicket)
api.post('/scanning/checkTicket', Scanning.checkTicket)

module.exports = api

