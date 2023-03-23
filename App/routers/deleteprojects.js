const express = require('express')
const router = express.Router()
const db = require('../models')
const jsonwebtoken= require('jsonwebtoken')
const config = require('../config/auth.config')
const materials = db.material
const projects = db.projects
router.delete("/deleteProject/:pid",verifyToken,async (req,res)=>{
try {

  jsonwebtoken.verify(req.token,config.secret , async(err, authData) => {
    if (err) {
      return res.status(401).send("invalid token");
    } else {
      const project = await projects.findOne({
        where: {
          id: req.params.pid,
        },
      });

      console.log(project)
      console.log(project.id)
      console.log(project.u_id)
    const exist = await materials.findAll({
        where: {
          p_id: project.id,
        },
      });
    console.log(exist)
    if(exist!=null){
        await materials.destroy({
            where:{
                p_id:project.id
            }
        })
        await projects.destroy({
            where:{
                id:req.params.pid
            }
        })
    }
  
        return res.status(200).send("project deleted successfully")
    }
  })
    
     
} catch (error) {
    return res.status(500).send("sorry some error occurs or the user have no projects")
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
