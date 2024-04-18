const express = require("express");
const authController = require("../controllers/auth.js");
const { authUser, storeRedirectToInSession } = require("../middlewares/authentication.js");
const passport = require("passport");
const controller = require("../controllers/departmentController.js");
const title = require('../middlewares/title.js');
const router = express.Router();

router.get("/", authController.getLogin);
router.get("/login", authController.getLogin);
router.post("/login", storeRedirectToInSession, passport.authenticate('local', {
    failureRedirect: "/login",
    failureFlash: true,
    keepSessionInfo: true
}), authController.postLogin);

router.get("/login/google", storeRedirectToInSession, passport.authenticate("google", {
    scope: ['profile', 'email']
}));
router.get("/login/google/redirect", passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true ,
    keepSessionInfo: true
}), authController.postLogin);

router.get("/login/facebook", storeRedirectToInSession, passport.authenticate("facebook", {scope : ['email'] }));
router.get("/login/facebook/callback", passport.authenticate("facebook", {
    failureRedirect: "/login",
    failureFlash: true,
    keepSessionInfo: true
}), authController.postLogin);


router.get("/logout", authUser, authController.getLogout);
router.get("/changePassword", authUser, authController.getChangePassword);
router.post("/changePassword", authUser, authController.postChangePassword);
router.get("/changeInfor", authUser, title.role, authController.changeInfor);
router.post("/changeInfor", authUser, authController.updateInfor);

router.get("/forget-password", authController.getForgetPassword);

router.post("/forget-password", authController.postForgetPassword);
router.get("/otp-waiting", authController.getOtpWaiting);
router.post("/otp-waiting", authController.postOtpWaiting);
router.get("/reset-password", authController.getResetPassword);
router.post("/reset-password", authController.postResetPassword);

module.exports = router;
