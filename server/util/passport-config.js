require("dotenv").config();
const passportLocal = require("passport-local");
const passportJwt = require("passport-jwt");
const bcrypt = require("bcrypt");

const { Strategy: JWTStragey, ExtractJwt } = passportJwt;
const { Strategy: LocalStrategy } = passportLocal;

function initializePassport(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = "test"; //  getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: "invalid login credentials" });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "invalid login credentials" });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  // const passportJwtOptions = {
  //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //   secretOrKey: process.env.JWT_SECRET_KEY,
  // };
}

module.exports = initializePassport;
