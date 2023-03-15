const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const mail = router.get("/sendmail", async (req, res) => {
try {
  let transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "engrdawoodisrar@gmail.com",
      pass: "",
    },
  });

   // send mail with defined transport object
   let info = await transporter.sendMail({
    from: '"👻" <engrdawoodisrar@gmail.com>', // sender address
    to: "waqas.khan.40004@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello Waqas khan how r u buddy ===================> zooooooooooooozzzzzzzzzzzzzzzz?", // plain text body
    html: "<b>Kaise hainnnnn.......... Ap?</b>", // html body
  });
  return res.status(200).json({detail:info})
} catch (error) {
  return res.status(500).json({error:error})
}
 
});
module.exports = mail;
