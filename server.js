const express = require("express");
var path = require("path");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
const cors = require("cors");
const compression = require("compression");
const config = require("./app/config/config");

const app = express();

const corsOptions = {
  origin: "http://localhost:8081",
};

// app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));
app.use(compression());
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: config.session.secret,
    name: config.session.name,
    cookie: {
      maxAge: config.session.cookie_time,
    },
    resave: false,
    saveUninitialized: true,
  })
);

// database
const db = require("./app/models");
const Role = db.role;
db.sequelize.sync().then(() => {
  // initial(); // Just use it in development, at the first time execution!. Delete it in production
})
// simple route
app.get("/",(req, res) => {
  const session = req.session;
  if (!session.num) {
    session.num = 0;
  }
  console.log(++session.num);
  // res.render('index', { title: `Express这是第 ${session.num} 次访问` });
  res.json({ message: "Hi there, welcome to this tutorial..." + session.num });
});

// api routes
require("./app/routes/book.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/key.routes")(app);

// app.use((err, req, res, next) => {
// 	res.status(err.status || 500)
// 	res.render('error', {
// 		layout: false,
// 		message: err.message,
// 		error: err
// 	})
// })


// set port, listen for requests
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Just use it in development, at the first time execution!. Delete it in production
function initial() {
  Role.create({
    id: 1,
    name: "user",
  });

  Role.create({
    id: 2,
    name: "moderator",
  });

  Role.create({
    id: 3,
    name: "admin",
  });
}
