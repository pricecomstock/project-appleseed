const jwt = require("jsonwebtoken");

async function authenticateToken(req, res, next) {
  // Format is:
  // Bearer TOKEN
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);
}

module.exports = { authenticateToken };
