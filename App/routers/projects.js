const express = require('express')
const router = express.Router()
const db = require('../models')
const jsonwebtoken = require('jsonwebtoken')
const projects = db.projects
const config = require('../config/auth.config')
router.post("/projects",verifyToken,async(req,res)=>{
try {
    jsonwebtoken.verify(req.token, config.secret, async(err, authData) => {
        if (err) {
          return res.status(401).send("invalid token");
        } else {
            await projects.create({
                name:req.body.name,
                area:req.body.area,
                no_of_roofs:req.body.no_of_roofs,
                rooms: req.body.rooms,
                avg_room_size: req.body.avg_room_size,
                attach_bath:req.body.attach_bath,
                attach_bath_size:req.body.attach_bath_size,
                kitchen:req.body.kitchen,
                kitchen_size:req.body.kitchen_size,
                u_id:req.body.u_id
              })
             return  res.status(200).json({message:"project created"})
        }
      })
    
} catch (error) {
    res.status(500).json(error)
}
})
//verify token function
function verifyToken(req, res, next) {
    var bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(" ");
      const token = bearer[1];
      req.token = token;
        console.log("from function"+
        req.token)
      next();
    } else {
      return res.status(401).send("invalid token")
    }
  }
module.exports = router