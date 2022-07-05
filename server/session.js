const session = require("express-session");

const setUpSessionStore = function (app) {
    app.use(session({
        secret: "maple",
        resave: false,
        saveUninitialized: false,
    }));
};

module.exports = setUpSessionStore;