require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const initializePassport = require("../util/passport-config");
const validator = require("validator");
const bcrypt = require("bcrypt");

initializePassport(passport);

const router = express.Router();
router.use(express.json());

const users = []; // TODO switch to DB

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "login",
  })
);

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  if (
    // TODO check if email exists
    validator.isEmail(email) &&
    validator.isLength(username, {
      min: 2,
      max: 16,
    }) &&
    validator.isLength(password, {
      min: 8,
      max: 1024,
    })
  ) {
    try {
      const salt = await bcrypt.genSalt();
      console.log("salt", salt);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // TODO database
      users.push({
        id: Date.now().toString(), // FIXME replace with db id
        email,
        username,
        salt,
        hashedPassword,
      });
      console.log("users", users);
    } catch (error) {
      console.error(error);
    }
  } else {
    res.sendStatus(400); // TODO split out reason for failure
  }
});

module.exports = router;
