const { use } = require("passport");
const passport = require("passport");
const localStrategy = require("passport-local");
const { User } = require("../persist/model");

passport.use(new localStrategy(async (username, password, done) => {
    let user;
    try {
        // Try to find the user
        user = await User.findOne({"username": username, "password": password});
        // Did we actually find something?
        if (!user) {
            done(null, false);
        }
        // We succeeded
        return done(null, user);
    } catch (err) {
        // There was an error
        return done(err)
    }
}))

const setUpAuth = function (app) {
    app.use(passport.initialize());
    app.use(passport.authenticate("session"));

    passport.serializeUser(function (user, cb) {
        cb(null, { 
            id: user._id, 
            username: user.username,
            fullname: user.fullname })
    });
    passport.deserializeUser(function (user, cb) {
        return cb(null, user)
    });
    app.post("/session", passport.authenticate("local"), (req, res) => {
        res.status(201).json({ 
            message: "successfully created session",
            username: req.user.username,
            fullname: req.user.fullname,
            user_id: req.user._id,
         });
    });
    app.get("/session", (req, res) => {
        if (!req.user) {
            res.status(401).json({ message: "unauthenticated -- please login" });
            return;
        }
        res.status(200).json({ 
            message: "successfully authenticated",
            username: req.user.username,
            fullname: req.user.fullname, });
    })

};

module.exports = setUpAuth;