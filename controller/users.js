const User=require("../models/user"); 

module.exports.renderSignupForm= (req, res) => {
    res.render("users/signup");
}

module.exports.signup=async (req, res) => {
    try {
        let { email, username, password } = req.body;

        let user = new User({ email, username });
        let registeredUser = await User.register(user, password);

        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) {
                req.flash("error", "Error occurred while logging in after signup.");
                return res.redirect("/login");
            }

            req.flash("success", "Successfully signed up!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm=(req, res) => {
    res.render("users/login");
}

module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";    
    res.redirect(redirectUrl);
}

module.exports.logout=(req, res,) => {
    req.logout((err) => {
        if (err) {
            req.flash("error", "Error occurred while logging out.");
        } else {
            req.flash("success", "You have been logged out.");
        }
        res.redirect("/listings");
    });
}