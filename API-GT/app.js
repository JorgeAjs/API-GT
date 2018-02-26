'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require("method-override")
const cookieParser = require('cookie-parser')
const app = express()
const api = require('./routes')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser());


// configure headers http
app.use(function (req,res,next){
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
	res.header('Allow','GET,POST,PUT,DELETE,OPTIONS');

	next();
});

//routes
app.use('/api',api)

module.exports =  app
