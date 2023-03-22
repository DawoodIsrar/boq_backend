const express = require('express')
const router = express.Router()
const db = require('../models')
const materials = db.material
router.get("/getTotalMaterial/:id",async (req,res)=>{
try {
    const exist = await materials.findAll({
        where: {
          p_id: req.params.id,
        },
      });
    console.log(exist)
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
