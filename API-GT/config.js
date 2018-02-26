

module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB || 'mongodb://localhost:27017/goticket',
  eventImagePath: "./uploads/events/images",
  venueImagePath: "./uploads/venues/images",
  CO_TimeZone:"UTC-05:00",
  itemsPerPage:10,
  idPrefix:"GTCO",
  mailUser:"contacto@goticket.co",
  mailPassword:"Cde34rfv!",
  mailService:"Zoho",
  mailHost:"smtp.zoho.com",
  mail:"contacto@goticket.co",
  customerIdEpayco:'13223',
  pKeyEpayco:'7830cfde540236dc657e42e1a85536b2958a9e0a'
}


