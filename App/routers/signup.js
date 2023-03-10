const express = require('express')
const router = express.Router()
const db = require("../models");
const bcrypt = require('bcrypt')
const users = db.users
//Sign Up
const signUp=  router.post("/signUp", async (req, res) => {
    // Save User to Database
    try {
      const exist = await users.findOne({
        where: {
          email: req.body.email,
        }
      });
     
  
      if (exist == null  && req.body.password == req.body.retypePassword) {
  
        try {
            users.create({
          
                username: req.body.username,
                email: req.body.email,
                position: req.body.position,
                password: bcrypt.hashSync(req.body.password, 8),
                retypePassword: bcrypt.hashSync(req.body.retypePassword, 8),
              })
              return res.status(500).send({ message:"user register successfully" });
        } catch (error) {
            console.log(error.message)
                  return res.status(500).send({ message: error.message });
        }
      } else {
        return res.status(500).send({ "message": "sorry user email already exist" })
      }
    } catch (err) {
      return res.status(500).send({ "message": err.message })
    }
  })

  module.exports = signUp;
