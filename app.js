const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/usernameAndPassword", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((e) => {
    console.log("Connection failed");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res, next) => {
  let { username, password } = req.body;
  try {
    let foundUser = await User.findOne({ username });
    if (foundUser) {
      res.send("Username has been taken!");
    } else {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          next(err);
        }

        bcrypt.hash(password, salt, function (err, hash) {
          // Store hash in your password DB.
          if (err) {
            next(err);
          }

          let newUser = new User({ username, password: hash });
          try {
            newUser
              .save()
              .then(() => {
                res.send("Data has been saved.");
                console.log("New User has been successfully saved");
              })
              .catch((e) => {
                res.send("Error!");
                console.log("Fail to save new user");
                console.log(e);
              });
          } catch (err) {
            next(err);
          }
        });
      });
    }
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  try {
    let foundUser = await User.findOne({ username });
    if (foundUser) {
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (err) {
          next(err);
        }
        if (result === true) {
          res.render("secret");
        } else {
          res.send("Username or password not correct");
        }
      });
    } else {
      res.send("Username or password not correct");
    }
  } catch (err) {
    res.send(err);
  }
});

app.get("/*", (req, res) => {
  res.render("404.ejs");
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something is broken, we will fix it!");
});

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
