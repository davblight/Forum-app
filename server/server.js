const express = require("express");
const { authenticate, session } = require("passport/lib");
const { User } = require("../persist/model")
const app = express();
const setUpAuth = require("./auth");
const setUpSession = require("./session");

// Tell your server how to handle json
app.use(express.json());

// Allow serving of UI code
app.use(express.static(`${__dirname}/public/`))

setUpSession(app);
setUpAuth(app);

app.post("/users", async (req, res) => {
    try {
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            password: req.body.password,
        });
        console.log("2")
        res.status(201).json(user);
        console.log("3")
    } catch (err) {
        res.status(500).json({
            message: `post request failed to create user`,
            error: err,
        })
    }
})

module.exports = app