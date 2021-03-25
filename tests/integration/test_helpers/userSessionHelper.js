const AuthSession = require("../../../models/AuthSession");
const User = require("../../../models/User");

const jwt = require("../../../services/jwt");

const { USER } = require("../../../enums/roles");

exports.generateUserSession = async (role = USER) => {
  const user = await new User({
    firstName: role,
    lastname: role,
    email: `${role}@gmail.com`,
    role,
    password: role,
    emailVerified: true,
  }).save();

  const authSesion = await new AuthSession({
    user: user._id,
    createdAt: new Date(),
  }).save();

  return jwt.encrypt({ _id: authSesion._id });
};

exports.cleanUserSession = async () => {
  await User.deleteMany({});
  await AuthSession.deleteMany({});
};
