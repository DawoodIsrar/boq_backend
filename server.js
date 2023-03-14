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
const material = require('./App/routers/materials')
const secretKey = "cstAttendence";
const googleAuth = require('./App/routers/oauth')


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
 app.get('/',(req,res)=>{
  res.status(200).send("successfully login")
 })
const users = db.users
app.use(mailRouter)
app.use(signUp)
app.use(logIn)
app.use(googleAuth)
app.use(material)
//==========================================================
//============(log in with google)==============================
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/', function(req, res) {
  res.send('hello to google log in');
});

const port =  8080;
app.listen(port , () => console.log('App listening on port ' + port));
const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '1011974050434-ejchqjg4flp6hjgemmp8t0camf5taad3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      console.log(userProfile)
      console.log(accessToken)
      console.log(refreshToken)
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/');
  });

 

 
      
    
 