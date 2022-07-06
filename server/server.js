const express = require("express");
const { authenticate, session } = require("passport/lib");
const { User, Thread } = require("../persist/model")
const app = express();
const setUpAuth = require("./auth");
const setUpSession = require("./session");

// Tell your server how to handle json
app.use(express.json());

// Allow serving of UI code
app.use(express.static(`${__dirname}/../public/`))

setUpSession(app);
setUpAuth(app);

app.post("/users", async (req, res) => {
    try {
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            password: req.body.password,
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: `post request failed to create user`,
            error: err,
        })
    }
})

app.get("/thread/:id", async (req, res) => {
    //Get the thread
    let threads;
    try {
        threads = await Thread.findById(req.params.id);
        if (!thread) {
            res.status(404).json({
                message: "thread not found",
            });
            return;
        }
    } catch (err) {
        res.status(500).json({
            message: "getByID request failed to get thread",
            error: err,
        });
    }
    //Get the user
    try {
        thread = thread.toObject();
        let user = await User.findById(thread.user_id, "-password");
        thread.user = user;
    } catch (err) {
        console.log(
            `unable to get user ${thread.user_id} when getting thread ${thread._id}: ${err}`
        )
    }
    //Get the users for all the posts

    //Return the thread
});

app.get("/thread", async (req, res) => {
    // No auth needed, auth is public/open
    // Get the threads
    let threads;
    try {
        threads = await Thread.find({}, "-posts");
    } catch (err) {
        res.status(500).json({
            message: "list request failed to get threads",
            error: err,
        });
    }

    // Get all the users for all the threads
    for (let k in threads) {
        try {
            //You have to do something here to get the users to actually show up in the response
            let user = await User.findById(threads[k].user_id, "-password");
            threads[k].user = user;
        } catch (err) {
            console.log(
                `unable to get user ${threads[k].user_id} when getting thread ${threads[k]._id}: ${err}`
            );
        }
    }

    // Return the threads
    res.status(200).json(threads);
});

app.post("/thread", async (req, res) => {
    //auth
    if (!req.user) {
        res.status(401).json({ message: "unauthed" });
        return;
    }
    // create with await + try/catch
    try {
        let thread = await Thread.create({
            user_id: req.user.id,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
        });
        res.status(201).json(thread);
    } catch (err) {
        res.status(500).json({
            message: "Could not creat thread",
            error: err,
        })
    }
})

app.delete("/thread/:id", (req, res) => {});

app.post("/post", async (req, res) => {
    //check auth
    if (!req.user) {
        res.status(401).json({ message: "unauthenticated -- please login" });
        return;
    }
    //find the thread and update it with the new post
    let thread;
    try {
        thread = await Thread.findByIdAndUpdate(
            //What is the id
            req.body.thread_id,
            //what to update
            {
                $push: {
                    posts: {
                        user_id: req.user.id,
                        body: req.body.body,
                        thread_id: req.body.thread_id
                    },
                },
            },
            { new: true }
            //options
        );
        if (!thread) {
            res.status(404).json({
                message: `thread not found`,
                id: req.body.thread_id,
            });
            return;
        }
    } catch (err) {
        res.status(500).json({
            message: `failed to insert post`,
            error: err,
        });
        return;
    }

    //return the (new) thread
    res.status(201).json(thread.posts[thread.posts.length-1]);
});

app.delete("/thread/:thread_id/post/:post_id", (req, res) => {});

module.exports = app