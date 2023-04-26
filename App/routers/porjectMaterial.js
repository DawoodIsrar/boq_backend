const express = require('express')
const router = express.Router()
const db = require('../models')
const materials = db.material
const jsonwebtoken = require('jsonwebtoken');
 router.get("/getTotalMaterial/:id",async (req,res)=>{
try {
  // let allow;
  // jsonwebtoken.verify(req.token, config.secret, (err, authData) => {
  //   if (err) {
  //     allow = false;
  //     console.log("allow token:" + allow);
  //     return res.status(401).send("invalid token");
  //   } else {
  //     allow = true;
  //     console.log("allow token:" + allow);
  //   }
  // });
  //  if(allow == true){
   
  //  }else{
  //   return res.status(500).send("invalid token")
  //  }
  const exist = await materials.findAll({
    where: {
      p_id: req.params.id,
    },
  });
  console.log("-------------------------------------")
console.log(exist)
if(exist!==null){
    return res.status(200).send(exist)
}else{
    return res.status(500).send("sorry some error occurs or the user have no projects")
}   
        }
    
      catch (error) {
    return res.status(500).send(" the user have no projects")
}
})
//verify token function
function verifyToken(req, res, next) {
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    console.log("from function" + req.token);
    next();
  } else {
    return res.status(401).send("invalid token");
  }
}
module.exports = router;
