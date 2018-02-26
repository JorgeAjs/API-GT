//Event
{
    "_id" : ObjectId("58ab1d2ebf573cc3f9ea2c6e"),
    "title" : "Justin Beaber Tour Latin America",
    "description" : "Por primera vez en Latinoamerica llega JB...",
    "time_zone" : "UTC-05:00",
    "date" : ISODate("2017-05-18T16:00:00.000Z"),
    "picture" : "conciertoJB_2017.jpg",
    "notes" : "Preventa a mitad de precio. No se permiten menores de edad...",
    "status" : "Active",
    "promoted" : true,
    "category" : [ 
        "Conciertos", 
        "Familia"
    ],
    "venue" : ObjectId("587cfe8248195b07937b646a")
}

/* 1 */
{
    "_id" : ObjectId("58c088a3e4f42850f81a6475"),
    "notes" : "ninguna",
    "picture" : "evento1.jpg",
    "date" : ISODate("2019-05-06T00:00:00.000Z"),
    "time_zone" : "UTC-05:00",
    "status" : "Active",
    "description" : "concierto al aire libre",
    "title" : "Rock al parque",
    "promoted" : false,
    "category" : [ 
        "rocksito"
    ],
    "venue" : ObjectId("587cfdb948195b07937b6411")
    "__v" : 0
}

//Promotor
{
    "_id" : ObjectId("58ab19b4bf573cc3f9ea2bc7"),
    "email" : "ybarcelo@gmail.com",
    "displayName" : "Producciones Barceló",
    "avatar" : "barcelo.jpg",
    "password" : "029d0c95b376a2a2909c3615f1ca37a8",
    "signupDate" : ISODate("2017-02-18T16:00:00.000Z"),
    "lastLogin" : ISODate("2017-03-18T16:00:00.000Z"),
    "nit" : "900156239-1",
    "address" : "Av 127 80 25",
    "phone" : "+57 3245987",
    "mobile" : "321698798",
    "website" : "http://wwww.produccionesbarcelo.com",
    "nameRep" : "Yassir",
    "lastnameRep" : "Barceló",
    "typeDocRep" : "CC",
    "documentRep" : "6598789787",
    "phoneRep" : "65498798",
    "mobileRep" : "316987987",
    "status" : "Active",
    "eventTypes" : [ 
        "Conciertos", 
        "Teatro", 
        "Congresos"
    ],
    "events" : [ 
        ObjectId("58ab1d2ebf573cc3f9ea2c6e")
    ]
}

//Ticket
/* 1 */
{
    "_id" : ObjectId("58ab1f4bbf573cc3f9ea2cdb"),
    "section" : "VIP",
    "row" : "",
    "seat" : "",
    "price" : 350000,
    "charge" : 25000,
    "subtotal" : 375000,
    "total" : 375000,
    "purchaseDate" : ISODate("2017-02-02T08:30:00.000Z"),
    "encryptCode" : "72052982-44d2ea9efc786013a76c1ae5e6921d44",
    "used" : false,
    "event" : ObjectId("58ab1d2ebf573cc3f9ea2c6e")
}
/* 2 */
{
    "_id" : ObjectId("58ab1f4cbf573cc3f93e2cdb"),
    "section" : "Platea A",
    "row" : "H",
    "seat" : "45",
    "price" : 50000,
    "charge" : 10000,
    "subtotal" : 60000,
    "total": 75412,
    "purchaseDate": ISODate("2017-01-02T05:00:00.000Z"),
    "encryptCode": "ar134sad12312dsa",
    "used" : false,
    "event" : ObjectId("58c088a3e4f42850f81a6475"),
}

/* User */
{
    "_id" : ObjectId("58ab17b1bf573cc3f9ea2b70"),
    "name" : "Ana Maria",
    "lastname" : "Casierra Martínez",
    "email" : "anacasierra@gmail.com",
    "password" : "029d0c95b376a2a2909c3615f1ca37a8",
    "zipCode" : "",
    "country" : "Colombia",
    "city" : "Bogotá",
    "region" : "Bogotá D.C",
    "typeDoc" : "CC",
    "document" : "102365987",
    "phone" : "3255687",
    "mobile" : "311545789",
    "birthDate" : ISODate("2001-05-18T16:00:00.000Z"),
    "address" : "Cra 17 31 53 Barrio La Unión"
}

/*Venue*/
/* 1 */
{
    "_id" : ObjectId("587cfcd548195b07937b63ac"),
    "country" : "Colombia",
    "city" : "Bogotá",
    "department" : "Cundinamarca",
    "address" : "Av NQS 54 - 32",
    "stage" : "Estadio el Campín",
    "picture" : "elcampin.jpg",
    "googleMaps" : "4.646088, -74.077485",
    "capacity" : "7500"
}

/* 2 */
{
    "_id" : ObjectId("587cfdb948195b07937b6411"),
    "country" : "Colombia",
    "city" : "Bogotá",
    "department" : "Cundinamarca",
    "address" : "Cl 153 152 - 54",
    "stage" : "Teatro Belarte",
    "picture" : "belarte.jpg",
    "googleMaps" : "4.726959, -74.024479",
    "capacity" : "1500"
}

/* 3 */
{
    "_id" : ObjectId("587cfe8248195b07937b646a"),
    "country" : "Colombia",
    "city" : "Bogotá",
    "department" : "Cundinamarca",
    "address" : "Av. de las Américas #36-2",
    "stage" : "Gran Carpa Américas - CORFERIAS,",
    "picture" : "belarte.jpg",
    "googleMaps" : "4.626711, -74.092884",
    "capacity" : "4700"
}