const db = require("../models");

const users = db.users();
checkDuplicateUsernameOrEmail = (req, res, next) => {

    users.findOne({
      where: {
        email: req.body.email
      }
    }).then(users => {
      if (users) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }
      next()
    });
};
const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
 
};
module.exports = verifySignUp;
