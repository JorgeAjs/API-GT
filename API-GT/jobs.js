'use strict'

const Agenda = require('agenda');
const Ticket = require('./models/ticket');
const User = require('./models/user');
const ForgottenPasswordRequest = require ('./models/forgottenPasswordRequest');

module.exports.initializeJobs = function (mongoConnectionString)
{   
    const agenda = new Agenda({db:{address:mongoConnectionString}});         

    //Define jobs here

    //Delete old tickets
    agenda.define('eraseUnpaidTickets', () => {
        
        let fifteenMinutesAgo = new Date(); 

        fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
        //console.log("deleting tickets older than ");
        //console.log(fifteenMinutesAgo.toISOString());
        Ticket.remove({$and:[{date: {$lte: fifteenMinutesAgo.toISOString()}}, {status: 1}]}
            ,(err) => {if(err) console.log("jobs/initializeJobs: "+err);});
    });

    //Delete pending tickets
    agenda.define('eraseUnpaidPendingTickets', () => {
        
        let fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 1);        
        //console.log("deleting tickets older than ");
        //console.log(fifteenMinutesAgo.toISOString());
        Ticket.remove({$and:[{date: {$lte: fiveDaysAgo.toISOString()}}, {status: 3}]}
            ,(err) => {if(err) console.log("jobs/initializeJobs: "+err);});
    });

    //Delete old forgotten password requests
    agenda.define('eraseOldForgottenPasswordRequests', () => {
        
        let oneDayAgo = new Date();        
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        ForgottenPasswordRequest.remove({date: {$lte: oneDayAgo.toISOString()}}
            ,(err) => {if(err) console.log("jobs/initializeJobs: "+err);});
    })

    //Delete pending users
    agenda.define('erasePendingUsers', () => {
        
        let oneDayAgo = new Date();        
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        User.remove({signupDate: {$lte: oneDayAgo.toISOString()}, status:"Inactive"}
            ,(err) => {if(err) console.log("jobs/initializeJobs: "+err);});
    })

    agenda.once('ready',() => {
        console.log('Agenda ready!');
        agenda.cancel({}); //Clear jobs from database

        //Schedule jobs here
        agenda.every('15 minutes', 'eraseUnpaidTickets');
        agenda.every('12 hours', 'eraseUnpaidPendingTickets');
        agenda.every('15 minutes', 'eraseOldForgottenPasswordRequests');
        agenda.every('15 minutes', 'erasePendingUsers');

        agenda.start();        
        console.log('Jobs running');
    })
};

