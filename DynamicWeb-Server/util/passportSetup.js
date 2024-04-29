const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");
const { Account, Area } = require("../models");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();

passport.serializeUser(function (account, done) {
  done(null, account.id);
});

passport.deserializeUser(async function (accountId, done) {
  try {
    const account = await Account.findOne({
      where: {
        id: accountId,
      },
    });

    if (account) {
      done(null, account);
    } else {
      done(null, false);
    }
  } catch (err) {
    console.error(err);
    done(err);
  }
});

const customFields = {
  usernameField: "usernameOrEmail",
  passwordField: "password",
};

const verifyCallback = async (usernameOrEmail, password, done) => {
  usernameOrEmail = usernameOrEmail ? usernameOrEmail.trim() : "";
  if (!usernameOrEmail) {
    return done(null, false, {
      message: JSON.stringify({
        flag: "usernameOrEmail",
        content: "Tên tài khoản hoặc email bị bỏ trống",
      }),
    });
  }

  try {
    const account = await Account.findOne({
      include: [{ model: Area }],
      where: {
        [Sequelize.Op.or]: {
          username: usernameOrEmail,
          email: usernameOrEmail,
        },
      },
    });
    if (!account) {
      return done(null, false, {
        message: JSON.stringify({
          flag: "usernameOrEmail",
          content: "Tên tài khoản hoặc email không tồn tại",
        }),
      });
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return done(null, false, {
        message: JSON.stringify({
          flag: "password",
          content: "Mật khẩu của bạn không hợp lệ",
        }),
      });
    }
    return done(null, account);
  } catch (err) {
    console.log(err);
    return done(err);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

const googleFacebookVerifyCallback = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  const email = profile.emails[0].value;
  // console.log("Email:" + email);
  try {
    const account = await Account.findOne({
      where: {
        email,
      },
    });
    if (!account) {
      return done(null, false, {
        message: JSON.stringify({
          flag: "socialLogin",
          content: "Không tồn tại tài khoản nào ứng với email của bạn",
        }),
      });
    }
    return done(null, account);
  } catch (err) {
    console.log(err);
    return done(err);
  }
};

const googleStrategy = new GoogleStrategy(
  {
    clientID:
      "583832591167-t64cf2lmvst3dagtl90t4q87m0h0urbr.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/login/google/redirect",
  },
  googleFacebookVerifyCallback
);
passport.use(googleStrategy);

const facebookStrategy = new FacebookStrategy(
  {
    clientID: "373877705120950",
    clientSecret: "cc665b69e1e7811f52d66ab35dd66b8c",
    callbackURL: "/login/facebook/callback",
    profileFields: [
      "id",
      "email",
      "gender",
      "link",
      "locale",
      "name",
      "timezone",
      "updated_time",
      "verified",
    ],
  },
  googleFacebookVerifyCallback
);
passport.use(facebookStrategy);
