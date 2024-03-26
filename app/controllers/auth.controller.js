const config = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../models");
const apiResponse = require("../utils/apiResponse");
const utility = require("../utils/utility");
const mailer = require("../utils/mailer");
const User = db.user;
const Role = db.role;
const Op = db.Op;
exports.sendEmail = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
  }
  let otp = utility.randomNumber(4);
  const session = req.session;
  session[req.body.email] = otp;
  let html =
    "<p>Please Confirm your Account in 5 miniutes.</p><p>OTP: " + otp + "</p>";
  mailer
    .sendMail(
      process.env.EMAIL_SMTP_USERNAME,
      req.body.email,
      "Confirm Your Account",
      html
    )
    .then(function () {
      console.log("mail sent");
      res.send({ message: "email sent successfully!" });
    })
    .catch((err) => {
      console.log(500, err);
      res.status(500).send({ message: err.message });
    });
};

exports.signup = (req, res) => {
  const errors = validationResult(req);
  const session = req.session;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(1, session);
  console.log(2, req.body);
  if (
    req.body.email in session &&
    session[req.body.email] == req.body.confirmOTP
  ) {
    // Save user to database
    User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      confirmOTP: req.body.confirmOTP,
    }).then((user) => {
      console.log("user created");
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: "Registered successfully!" });
          });
        });
      } else {
        // User role 1
        user.setRoles([1]).then(() => {
          res.send({ message: "Registered successfully!" });
        });
      }
    });
  } else {
    res.send({ message: "Confirmed fail!" });
  }
};
exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      let token = jwt.sign({ id: user.id }, config.auth.secret, {
        expiresIn: config.auth.jwt_expiresIn, // second
      });

      let authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
