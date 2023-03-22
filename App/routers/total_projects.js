const express = require('express')
const router = express.Router()
const db = require('../models')
const projects = db.projects
router.get("/getTotalProject/:id",async (req,res)=>{
try {
    const exist = await projects.findAll({
        where: {
          u_id: req.params.id,
        },
      });
    
    if(exist!=null){
        return res.status(200).send(exist)
    }else{
        return res.status(500).send("sorry some error occurs or the user have no projects")
    }  
} catch (error) {
    return res.status(500).send("sorry some error occurs or the user have no projects")
}
})
module.exports = router
