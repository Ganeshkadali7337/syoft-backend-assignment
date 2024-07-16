const jwt = require("jsonwebtoken");

const Authenticate = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (!jwtToken) {
    res.status(400);
    res.send({ status: 400, msg: "Invalid JWT Token" });
  } else {
    jwt.verify(jwtToken, "user", async (error, payload) => {
      if (error) {
        res.status(400);
        res.send({ status: 400, msg: "Invalid JWT Token" });
      } else {
        req.userId = payload.id;
        req.role = payload.role;
        next();
      }
    });
  }
};

module.exports = Authenticate;
