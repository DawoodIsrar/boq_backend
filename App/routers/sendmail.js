const express = require("express");
const router = express.Router();
const mail = router.get("/sendmail", async (req, res) => {
res.status(200).json({message:"hello to the mail"})
});
module.exports = mail;