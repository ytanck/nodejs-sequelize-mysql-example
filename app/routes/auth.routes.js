const { verifySignUp } = require("../middlewares");
const authController = require("../controllers/auth.controller");
const {
  body,
  query,
  validationResult,
  sanitizeBody,
  check,
} = require("express-validator");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );

    next();
  });
  app.post(
    "/api/auth/signup",
    [
      body("username")
        .isLength({ min: 1 })
        .trim()
        .withMessage("username must be specified.")
        .isAlphanumeric()
        .withMessage("用户名只能是数字或字母"),
      body("email")
        .isLength({ min: 1 })
        .trim()
        .withMessage("Email must be specified.")
        .isEmail()
        .withMessage("Email must be a valid email address."),
      body("password")
        .isLength({ min: 6 })
        .trim()
        .withMessage("Password must be 6 characters or greater."),
      // sanitizeBody("username").escape(),
      // check("username").exists(),
      // check("email").exists(),
      // check("password").exists(),
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkRolesExisted,
    ],
    authController.signup
  );

  app.post(
    "/api/auth/send-email",
    [
      body("email")
        .isLength({ min: 1 })
        .trim()
        .withMessage("Email must be specified.")
        .isEmail()
        .withMessage("Email must be a valid email address."),
      verifySignUp.checkDuplicateEmail,
    ],
    authController.sendEmail
  );
  app.post("/api/auth/signin", authController.signin);
};
