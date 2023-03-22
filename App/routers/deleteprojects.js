const express = require('express')
const router = express.Router()
const db = require('../models')
const materials = db.material
const projects = db.projects
router.delete("/deleteProject/:pid",async (req,res)=>{
try {
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
  
        return res.status(200).send("project deleted")
     
} catch (error) {
    return res.status(500).send("sorry some error occurs or the user have no projects")
}
})
module.exports = router
