const express = require('express')
const router = express.Router()
const db = require('../models')
const projects = db.projects
router.post("/projects",async(req,res)=>{
try {
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
      res.status(200).json({m:"created"})
} catch (error) {
    res.status(500).json(error)
}
})
module.exports = router