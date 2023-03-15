const express = require('express')
const app = express();
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20');
app.use(passport.initialize());
const db =require('../models')
const User = db.users
passport.use(new GoogleStrategy({
    clientID:"1011974050434-ejchqjg4flp6hjgemmp8t0camf5taad3.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL:"https://localhost:8080/google/callback"
},function(accessToken,refreshToken,profile,done){
    console.log(accessToken)
    console.log(refreshToken)
    console.log(profile)
    console.log(done)
}))


const router = express.Router()
router.get("/auth/google",passport.authenticate('google',{
    scope:['profile']
}))
router.get("/google/callback",passport.authenticate("google"),async(req,res)=>{
    res.redirect('/')
})
router.get('/home',(req,res)=>{
    res.status(200).send("hy")
})
module.exports = router;

