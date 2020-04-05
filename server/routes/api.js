const express = require("express");
const router = express.Router();

// TODO Switch to sending react app bundle
router.get("/", (req, res) => {
  res.send({ response: "Welcome to the API!" }).status(200);
});

module.exports = router;
