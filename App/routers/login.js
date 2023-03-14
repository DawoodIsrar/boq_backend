const express = require('express')
const router = express.Router()
const db = require("../models");
const bcrypt = require('bcrypt') 
const users = db.users
const config = require("../config/auth.config")
const jsonwebtoken = require('jsonwebtoken')
 //LogIn
const logIn = router.post("/logIn", async (req, res) => {
  users.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(users => {
      if (!users) {
        return res.status(404).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        users.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      var token = jsonwebtoken.sign({ id: users.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
        res.status(200).send({
          id: users.id,
          username: users.username,
          email: users.email,
          accessToken: token
        });
      }).catch((err)=>{
          res.status(500).json({message:`${err.message}`})
      });
    })

    module.exports = logIn;