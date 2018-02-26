'use strict'
/*const cluster = require('cluster');
//Bloque para cluster
if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Inicial el proceso master  con ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' se encuentra activo');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + 'murió con el codigo: ' + code + ', and signal: ' + signal);
        console.log('Iniciando de nuevo el worker');

        cluster.fork();
    });
} else {

      /*Generales*/
      const mongoose = require('mongoose')
      const app = require('./app')
      const config = require('./config')
      /* Para almacenar archivos enviados por POST*/
      /*const multer  = require('multer')
      var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, config.eventImagePath)
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname +'.jpg')   //OJO.  revisar la extesión
        }
      })
      var upload = multer({storage: storage})*/
      //----------------------------------------//
      const nodemailer = require('@nodemailer/pro');  // Para el envío de correos
      const fs = require('fs');             // Para almacenar primero el QR en filesystem
      const pdf = require('html-pdf');     //Para convertir html a pdf
      const webshot = require('webshot');  //Para convertir html a JPG
      //------------------------------------//
      const passport = require('passport') // Para la autienticación con Redes sociales
      const LocalStrategy = require('passport-local').Strategy  //Para la autenticación local
      //--------------------------------//
      const path = require('path')
      const logger = require('morgan')

      const jobs = require('./jobs')


      var uri;
      var vcap;
      if (process.env.VCAP_SERVICES) {
         console.log("Loaded VCAP-SERVICES", process.env.VCAP_SERVICES);
        var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
        vcap=vcap_services['compose-for-mongodb'][0].credentials;
        //uri = env.uri;
      }else{
        try {
          var vcap = require('./vcap-local.json');
        } catch (e) { }
      }
      if(vcap){
        var ca = [new Buffer(vcap.ca_certificate_base64, 'base64')];
        var options = {
          mongos: {
            ssl: true,
            sslValidate: true,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
          }
        }
        var uri=vcap.uri;
        uri = uri.replace(/compose/g,'goticket');
        console.log("uri ",uri);
        mongoose.connect(uri, options, (err) => {
        //mongoose.connect(config.db, options, (err) => {
          if (err) {
            return console.log(`Error al conectar a la base de datos ${err}`)
          }

          console.log('conexión a la base de datos establecida...')

         //jobs.initializeJobs(config.db);

          app.listen(config.port, () => {
            console.log(`API Corriendo en http://localhost:${config.port}`)
             //console.log(new Date());

          })
        })


      }else{
        console.log("no credentials for database connection");
      }
      

//}
