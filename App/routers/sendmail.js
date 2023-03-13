const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const mail = router.get("/sendmail", async (req, res) => {
  let transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "michellekim408@gmail.com",
      pass: "Michelle@1433",
    },
  });

   // send mail with defined transport object
   let info = await transporter.sendMail({
    from: '"👻" <dawood@cybersynctech.com>', // sender address
    to: "muneebahmed0305@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello Munneb ahmed sahab?", // plain text body
    html: "<b>Kaise hainnnnn.......... Ap?</b>", // html body
  });
  return res.status(200).json({detail:info})
});
module.exports = mail;
