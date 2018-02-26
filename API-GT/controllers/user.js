'user strinct'

const User = require('../models/user')
const bcrypt = require('bcrypt-nodejs')
const mongoosePaginate = require('mongoose-pagination')
const jwt = require('../services/jwt')
const config = require('../config')
const ForgottenPasswordRequest = require ('../models/forgottenPasswordRequest')
const Mailer = require('../controllers/mail')
const md5 = require('md5')
const Templating = require('../services/templating')

function sendMailProducerRegistration(producer,password)
{
  var producerMailTemplatePath = "./mail_templates/producer_registration.html";
  var parameters = [];

  parameters.push({placeholder:"###USERNAME###",value:producer.email});
  parameters.push({placeholder:"###PASSWORD###",value:password});

  Templating.fillTemplate(parameters,producerMailTemplatePath,function(err,mailHTML)
  {
    if(err) {console.log("user/sendMailProducerRegistration:"+err); return;}
    Mailer.sendMailHTML(producer.email,"Bienvenido a GoTicket",mailHTML,null);
  });
}

function sendMailUserRegistration(user)
{
  var producerMailTemplatePath = "./mail_templates/user_registration.html";
  var parameters = [];

  parameters.push({placeholder:"###USERNAME###",value:user.email});
  parameters.push({placeholder:"###ACTIVATIONLINK###",value:'https://goticket.co/activateUser/'+user._id});
  //console.log(parameters);
  Templating.fillTemplate(parameters,producerMailTemplatePath,function(err,mailHTML)
  {
    if(err) {console.log("user/sendMailUserRegistration:"+err); return;}    
    Mailer.sendMailHTML(user.email,"Bienvenido a GoTicket",mailHTML,null);
  });
}

/*
 * Obtiene el detalle de un Usuario dado su ID
 * @method /api/users/:userId'
 * @return Json con la información del Usuario
 * 
 */
function getUser (req,res){
  let userId = req.params.userId

  User.findById(userId,(err, user) => {
    if (err) return res.status(500).send({ message: `Error al realizar la petición ${err}`})
    if (!user) return res.status(404).send({ message: `El usuario no existe`})
    res.status(200).send(user)
  })
}

/*
 * Revisa la existencia de un usuario en la BD dado su email o su numero de documento
 * @method /api/users/userExists'
 * @return Json con la información del Usuario si existe y error 404 con mensaje si no existe
 * 
 */
function userExists(req, res){
  let data = req.body

  let email = data.email
  let document = data.document

  let jsonData={};
  if(data.email && data.document){
    jsonData={email:email.toLowerCase(),document:document};
  }else if(data.email){
    jsonData={email:email.toLowerCase()};
  }else if(data.document){
    jsonData={document:document};
  }

  User.findOne(jsonData, (err, user) =>{
    if (err) return res.status(500).send({ message: `Error en la peticion ${err}`})

    if (!user) return res.status(200).send({ message: `El usuario no existe`})
    res.status(200).send({user:user})
  })
}


/*
 * Obtiene todos los usuarios
 * @method /api/users/
 * @return Json con todos los usuarios
 * 
 */
function getUsers (req,res){
  var page = 1
  if(req.params.page){
     page = req.params.page
  }
  let itemsPerPage=config.itemsPerPage;

  User.find({role:'USER'}).sort('name').paginate(page,itemsPerPage, (err, users, total) => {
    if(err){
      res.status(500).send({message: `Error en la petición`})
    }else{
      if(!users){
        res.status(404).send({message: `No hay usuarios`})
      }else{
        return res.status(200).send({
          totalItems: total,
          users: users
        })
      }
    }
  })
  /*User.find({},(err,users) => {
    if (err) return res.status(500).send({ message: `Error al realizar la perición ${err}`})
    if (!users) return res.status(404).send({ message:`No existen Usuarios`})

    res.status(200).send({users})
  })*/
}

/*
 * Almaneca un usuario en la Collection User
 * @method POST: /api/user/
 * @return Json con el nuevo usuario
 * 
 */
function saveUser (req, res){
  let data = req.body  
  let user = new User()
  user.name = data.name
  user.lastname = data.lastname
  user.email = data.email
  user.password = data.password
  user.zipCode = data.zipCode
  user.country = data.country
  user.city = data.city
  user.region = data.region
  user.typeDoc = data.typeDoc
  user.document = data.document
  user.phone = data.phone
  user.mobile = data.mobile
  user.birthDate = data.birthDate
  user.address = data.address
  user.role='USER'
  user.signupDate = new Date().toISOString() //Ojo esta arrojando la hora mal.
  user.lastLogin = new Date().toISOString()
  user.acceptTerms1 = data.acceptTerms1
  user.acceptTerms2 = data.acceptTerms2
  user.gender = data.gender,
  user.occupation = data.occupation,
  user.stratum = data.stratum,
  //user.status = "Pending" when mail confirmation is ready uncomment this. Jaime
  user.status = "Active"

  user.validate((err) => {
    if (err) return res.status(500).send({message:`Datos recibidos incorrectos ${err}`})

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send({message:`Error en servidor ${err}`})

      bcrypt.hash(user.password, salt, null, (err, hash) => {
        if (err) return res.status(500).send({message:`Error en servidor ${err}`})

        user.password = hash

        user.save( (err, userStored) => {
          if(err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})

          return res.status(200).send({user: userStored})
        })
      })
    })
  })
}

/*
 * Registra un nuevo usuario con correo y contraseña en la base de datos y envia 
 * el correo de confirmación
 * @method POST: /api/user/
 * @return Json con el nuevo usuario
 * 
 */
function registerUser (req, res){
  let data = req.body  
  let user = new User()
  user.role='USER'
  user.email = data.email
  user.password = data.password
  user.status = "Pending confirmation"
  user.signupDate = new Date().toISOString() //Ojo esta arrojando la hora mal.
  user.lastLogin = new Date().toISOString()
  user.acceptTerms1 = data.acceptTerms1
  user.acceptTerms2 = data.acceptTerms2

  user.validate((err) => {
    if (err) return res.status(500).send({message:`Datos recibidos incorrectos ${err}`})

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send({message:`Error en servidor ${err}`})

      bcrypt.hash(user.password, salt, null, (err, hash) => {
        if (err) return res.status(500).send({message:`Error en servidor ${err}`})

        user.password = hash

        user.save( (err, userStored) => {
          if(err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})

          sendMailUserRegistration(userStored);

          return res.status(200).send({user: userStored})
        })
      })
    })
  })
}

/*
 * Actualiza el password de un usuario en la Collection User
 * @method PUT: /api/users/updatePassword/:id
 * @return Json con el usuario actualizado
 * 
 */
function updateUserPassword (req, res){
  let userId = req.params.userId
  let data = req.body

  let pass = data.password
  let newpass = data.newPassword

  User.findById(userId, (err, user) =>{
    if (err) return res.status(500).send({ message: `Error en la peticion ${err}`})

    if (!user) return res.status(404).send({ message: `El usuario no existe`})

    bcrypt.compare(pass,user.password, (err, check) => {
      if (check){
        bcrypt.genSalt(10, (err, salt) => {
          if (err) return res.status(500).send({message:`Error en servidor ${err}`})

          bcrypt.hash(newpass, salt, null, (err, hash) => {
            if (err) return res.status(500).send({message:`Error en servidor ${err}`})

            User.findByIdAndUpdate(userId, {password:hash}, (err, userUpdated) => {
              if (err) res.status(500).send({ messsage: `Error al actualizar password de usuario ${err}`})

              if(!userUpdated) res.status(404).send({message: `No se ha podido actualizar el password de usuario`})

              return res.status(200).send({ user: userUpdated})
            })
          })
        })
      }else{
        res.status(404).send({ message: `Clave de usuario incorrecta`})
      }
    })
  })
}

/*
 * Actualiza la información de un usuario en la Collection User
 * @method PUT: /api/users/
 * @return Json con el usuario actualizado
 * 
 */
function updateUser(req, res){
  let userId = req.params.userId
  let update = req.body

  User.findByIdAndUpdate(userId, { $set: update}, (err, userUpdated) => {
    if (err) res.status(500).send({ messsage: `Error al actualizar el usuario ${err}`})

    if(!userUpdated) res.status(404).send({message: `No se ha podido actualizar el usuario`})

    return res.status(200).send({ user: userUpdated})
  })
}

/*
 * Actualiza el estado de user a activo
 * @method PUT: /api/user/activate/:userId'
 * @return user actualizado
 * 
 */
function activateUser (req, res){
  let userId = req.params.userId
  
  User.findByIdAndUpdate(userId, {"status":"Active"}, (err, userUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el user ${err}`})
      //console.log(userUpdated)
    return res.status(200).send({ user: userUpdated})
  })
}


/*
function deleteUser (req, res){
  let userId = req.params.userId

  User.findById(userId, (err, user) => {
    if (err) res.status(500).send({ messsage: `Error al eliminar el ticket ${err}`})

    user.remove( err => {
      if (err) res.status(500).send({ messsage: `Error al actualizar el ticket ${err}`})

      return res.status(200).send({ message: `El usuario ha sido borrado correctamente`})
    })
  })
}
*/
function loginUser(req, res){
  let data = req.body

  let email = data.email
  let password = data.password

  User.findOne({ email: email.toLowerCase()}, (err, user) =>{

    if (err) return res.status(500).send({ message: `Error en la peticion ${err}`})

    if (!user) return res.status(404).send({ message: `El usuario no existe`})

    if (user.status!="Active") return res.status(404).send({ message: `El usuario no se encuentra activo`})

    bcrypt.compare(password,user.password, (err, check) => {
      if (check){
        if (data.gethash){
          //devolver el token de jwt
          res.status(200).send({
            token: jwt.createToken(user)

          })
        }else{
          res.status(200).send({user})
        }
      }else{
        res.status(404).send({ message: `El usuario no ha podido iniciar sesión. Clave o usuario incorrecto`})
      }
    })
  })
}


/*
 * Obtiene el detalle de un Producer dado su ID
 * @method /api/producers/:producerId'
 * @return Json con la información del producer
 * 
 */
function getProducer (req, res){
  let producerId = req.params.producerId

  User.findById(producerId, (err, producer) => {
    if (err) return res.status(500).send({message:`Error al realizar la petición ${err}`})

    if(!producer) return res.status(404).send({message:`El producto no existe`})

    return res.status(200).send(producer)
  })
}

/*
 * Obtiene el listado de todos los producers paginados
 * @method /api/producer/'
 * @return Json con la información del producer
 * 
 */
function getProducers (req, res){
  var page = 1
  if(req.params.page){
     page = req.params.page
  }
  let itemsPerPage=config.itemsPerPage;

  User.find({role:'PRODUCER'}).sort('name').paginate(page,itemsPerPage, (err, producers, total) => {
    if(err){
      res.status(500).send({message: `Error en la petición`})
    }else{
      if(!producers){
        res.status(404).send({message: `No hay usuarios`})
      }else{
        return res.status(200).send({
          totalItems: total,
          producers: producers
        })
      }
    }
  })
}

/*
 * Almacena los registos en la Collection de producer
 * @method POST: /api/producer/events/:producerId'
 * @return Producer
 * 
 */
function saveProducer (req, res){
  //console.log('POST api/producer')
  let data = req.body
  //console.log(data)
  let producer = new User()
  producer.role='PRODUCER'
  producer.email = data.email
  producer.name = data.name
  producer.avatar = data.avatar
  producer.password = data.password
  producer.signupDate = new Date().toISOString() //Ojo esta arrojando la hora mal.
  producer.lastLogin = new Date().toISOString()
  producer.nit = data.nit
  producer.address = data.address
  producer.phone = data.phone
  producer.mobile = data.mobile
  producer.website = data.website
  producer.nameRep = data.nameRep
  producer.lastnameRep = data.lastnameRep
  producer.typeDocRep = data.typeDocRep
  producer.documentRep = data.documentRep
  producer.phoneRep = data.phoneRep
  producer.mobileRep = data.mobileRep
  //producer.status = "Pending" uncomment when mail confirmation is ready
  producer.status="Active"
  producer.producerCode=data.producerCode
  producer.eventTypes = data.eventTypes

  producer.validate((err) => {
    if (err) return res.status(500).send({message:`Datos recibidos incorrectos ${err}`})

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send({message:`Error en servidor ${err}`})

      bcrypt.hash(producer.password, salt, null, (err, hash) => {
        if (err) return res.status(500).send({message:`Error en servidor ${err}`})

        producer.password = hash

        producer.save( (err, producerStored) => {
          if(err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})

          return res.status(200).send({producer: producerStored})
        })
      })
    })
  })
}

/*
 * Registra un nuevo usuario con correo y contraseña en la base de datos y envia 
 * el correo de confirmación
 * @method POST: /api/producer/events/:producerId'
 * @return Producer
 * 
 */
function registerProducer (req, res){
  //console.log('POST api/producer')
  let data = req.body
  //console.log(data)
  let producer = new User()
  producer.role='PRODUCER'
  producer.email = data.email
  producer.name = data.name
  producer.avatar = data.avatar
  producer.password = data.password
  producer.signupDate = new Date().toISOString() //Ojo esta arrojando la hora mal.
  producer.lastLogin = new Date().toISOString()
  producer.nit = data.nit
  producer.address = data.address
  producer.phone = data.phone
  producer.mobile = data.mobile
  producer.website = data.website
  producer.nameRep = data.nameRep
  producer.lastnameRep = data.lastnameRep
  producer.typeDocRep = data.typeDocRep
  producer.documentRep = data.documentRep
  producer.phoneRep = data.phoneRep
  producer.mobileRep = data.mobileRep
  //producer.status = "Pending" uncomment when mail confirmation is ready
  producer.status="Active"
  producer.producerCode=data.producerCode
  producer.eventTypes = data.eventTypes
  producer.acceptTerms1 = data.acceptTerms1
  producer.acceptTerms2 = data.acceptTerms2

  producer.validate((err) => {
    if (err) return res.status(500).send({message:`Datos recibidos incorrectos ${err}`})

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send({message:`Error en servidor ${err}`})

      bcrypt.hash(producer.password, salt, null, (err, hash) => {
        if (err) return res.status(500).send({message:`Error en servidor ${err}`})

        producer.password = hash

        producer.save( (err, producerStored) => {
          if(err) return res.status(500).send({message:`Error al salvar en la base de datos ${err}`})

          sendMailProducerRegistration(producerStored,data.password);

          return res.status(200).send({producer: producerStored})
        })
      })
    })
  })
}

/*
 * Actualiza los registos en la Collection de producer
 * @method POST: /api/producer/events/:producerId'
 * @return Array de todos los eventos activos
 * 
 */

function updateProducer (req, res){
  let producerId = req.params.producerId
  let update = req.body
  User.findByIdAndUpdate(producerId, {$set:update}, (err, producerUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el producer ${err}`})

    return res.status(200).send({ producer: producerUpdated})
  })
}

/*
 * Actualiza el estado de producer a activo
 * @method POST: /api/producer/activate/:producerId'
 * @return producer actualizado
 * 
 */

function activateProducer (req, res){
  let producerId = req.params.producerId
  User.findByIdAndUpdate(producerId, {"status":"Active"}, (err, producerUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el producer ${err}`})

    return res.status(200).send({ producer: producerUpdated})
  })
}


/*
 * Actualiza el estado de producer a Inactivo
 * @method POST: /api/producer/deactivate/:producerId'
 * @return producer actualizado
 * 
 */

function deactivateProducer (req, res){
  let producerId = req.params.producerId
  User.findByIdAndUpdate(producerId, {"status":"Inactive"}, (err, producerUpdated) => {
    if (err) return res.status(500).send({message:`Error al actualizar el producer ${err}`})

    return res.status(200).send({ producer: producerUpdated})
  })
}

/*
 * Recibe una solicitud para configurar una nueva contraseña y envía correo con link para hacerlo
 * @method POST: /users/requestForgottenPasswordChange'
 * @return solamente código de éxito
 * 
 */
function processForgottenPasswordRequest(req,res)
{
  let userEmail = req.body.email;
  //console.log(userEmail);

  User.findOne({email: userEmail},function(err,user)
  {
    if (err) return res.status(500).send({message:`Error al buscar usuario ${err}`});

    if (user === null)  return res.status(500).send({message:`Usuario no encontrado`});

    ForgottenPasswordRequest.remove({user: user._id},(err) =>
    {
      let authorizationCode = md5(user._id + (new Date()).toString());
        
      forgottenPasswordRequest = new ForgottenPasswordRequest();
      
      forgottenPasswordRequest.user = user._id;
      forgottenPasswordRequest.authorizationCode = authorizationCode;
      forgottenPasswordRequest.date = new Date();
      
      forgottenPasswordRequest.save((err,savedRequest) => 
      {
        let mailHTML = "<html><p>Haz clic <a href=\"goticket.co/passwordRecovery2/"+savedRequest._id+"/"+authorizationCode+"\">aquí</a> para configurar una nueva contraseña</p></html>";
        
        Mailer.sendMailHTML(user.email,"Recuperación de contraseña",mailHTML,[]);
        return res.status(200).send({ recover: true});      
      });
    });
  });
}

/*
 * Cambia contraseña del usuario, cuando se ha previamente solicitado
 * @method POST: /users/changeForgottenPassword'
 * @return booleano indicando si el proceso se completó con éxito
 * 
 */
function changeForgottenPassword(req,res)
{  
  let idRequest = req.body.r;
  let authorizationCode = req.body.a;
  let newpass = req.body.newPassword;    

  ForgottenPasswordRequest.findOne({_id: idRequest},(err,request)=>
  {
    if(request === null)        
      return res.status(400).send({ message: 'Código de autorización inválido'});

    if (authorizationCode !== request.authorizationCode)
      return res.status(400).send({ message: 'Código de autorización inválido'});

      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).send({message:`Error en servidor ${err}`})

        bcrypt.hash(newpass, salt, null, (err, hash) => {
          if (err) return res.status(500).send({message:`Error en servidor ${err}`})

          User.findByIdAndUpdate(request.user, {password:hash}, (err, userUpdated) => {
            if (err) res.status(500).send({ messsage: `Error de base de datos`})

            if(!userUpdated) res.status(404).send({message: `Error de base de datos`})

            ForgottenPasswordRequest.remove({user:request.user},(err) =>
              { return res.status(200).send({ success: true }); }
            )
          })
        })
      })
  });  
}

module.exports = {
  getUser,
  loginUser,
  getUsers,
  saveUser,
  registerUser,
  updateUser,
  activateUser,
  userExists,
  getProducer,
  getProducers,
  saveProducer,
  registerProducer,
  updateProducer,
  activateProducer,
  deactivateProducer,
  updateUserPassword,
  processForgottenPasswordRequest,
  changeForgottenPassword
}
