const express = require('express');
const path = require('path');
const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoDb = 'mongodb+srv://zinaMongo:z**m$$1973@cluster0-typlj.mongodb.net/nodeFaces?retryWrites=true&w=majority';
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
    "User",
    new Schema({
      username: { type: String, required: true },
      password: { type: String, required: true }
    })
  );
  
  const app = express();
  
  app.set('views', path.join(__dirname, 'views'));
  app.set("view engine", "ejs");

  passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        };
        if (!user) {
          return done(null, false, { msg: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { msg: "Incorrect password" });
        }
        return done(null, user);
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });



  app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.urlencoded({ extended: false }));

  app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );
  
  app.get("/", (req, res) => {
    res.render("index", { user: req.user });
  });
  
  
  
  app.get("/sign-up", (req, res) => res.render("sign-up-form"));

  app.post("/sign-up", (req, res, next) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    }).save(err => {
      if (err) { 
        return next(err);
      };
      res.redirect("/");
    });
  });


  app.listen(3000, () => console.log("app listening on port 3000!"));
  