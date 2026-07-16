if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");

const bookingRoutes = require("./routes/booking");
const listings = require("./routes/listing");
const reviews = require("./routes/review");
const userRoutes = require("./routes/user");

const User = require("./models/user");

const dbUrl = process.env.ATLASDB_URL;

console.log("LocationIQ Key:", process.env.LOCATIONIQ_API_KEY);
console.log("Mongo URL:", dbUrl);

// ======================
// MongoDB Connection
// ======================

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(8080, () => {
            console.log("Server is running on port 8080");
        });
    })
    .catch((err) => {
        console.log(err);
    });

// ======================
// View Engine
// ======================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ======================
// Middlewares
// ======================

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// ======================
// Mongo Session Store
// ======================

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Mongo Session Store Error:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// ======================
// Passport
// ======================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// Flash Messages
// ======================

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// ======================
// Routes
// ======================

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", bookingRoutes);
app.use("/", userRoutes);

app.get("/privacy", (req, res) => {
    res.render("privacy");
});

app.get("/terms", (req, res) => {
    res.render("terms");
});

// ======================
// Error Handling
// ======================

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("error", {
        err,
        message,
    });
});