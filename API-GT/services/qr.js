'use strict'

const qr = require('qr-image');

module.exports.generateQRimage = function(theString)
{
    let myQR = qr.image(theString,{type: 'png'});
    return myQR; //A stream
}

module.exports.generateQRpdf = function(theString)
{
    let myQR = qr.image(theString,{type: 'pdf'});
    return myQR; //A stream
}

module.exports.getQRdata = function(ticket)
{
    return ticket._id+'-'+ticket.encryptedCode;
}

