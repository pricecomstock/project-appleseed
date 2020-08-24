const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validator = require("validator");
const bcrypt = require("bcrypt");

const router = express.Router();
router.use(express.json());

const users = []; // TODO switch to DB

console.log("ENV", process.env);

router.post("/login", (req, res) => {
  // TODO authenticate user

  const username = "TEST_USER";
  const expiresAt = Date.now() + 3600 * 24; // 24 hours for now
  const promptAccess = true;
  const user = {
    username,
    expiresAt,
    promptAccess,
  };

  const accessToken = jwt.sign(user, process.env.JWT_SECRET_KEY);
  res.json({ accessToken });
});

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
