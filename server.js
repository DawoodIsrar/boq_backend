const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jsonwebtoken = require("jsonwebtoken");
const app = express();
const config = require("./App/config/auth.config")
require('dotenv').config();
const mailRouter = require('./App/routers/sendmail')
const signUp = require('./App/routers/signup')
const logIn = require('./App/routers/login')
const secretKey = "cstAttendence";


// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./App/models");
//database connection
db.sequelize.sync({ force: false }).then(() => {
  console.log('database connected');
  // initial()
});
//process.env.PORT || 
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
 
const users = db.users
app.use(mailRouter)
app.use(signUp)
app.use(logIn)


 
      
    
 