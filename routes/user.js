const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController =require("../controller/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup))

router.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    (req, res, next) => {
        console.log("Login request:", req.body);
        next();
    },
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res, next) => {
        console.log("Authenticated User:", req.user);
        next();
    },
    wrapAsync(userController.login)
);


router.get("/logout", userController.logout);


module.exports = router;