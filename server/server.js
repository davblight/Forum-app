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
    let thread;
    try {
        thread = await Thread.findById(req.params.id);
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
    for (post in thread.posts) {
        try {
            let user = await User.findById(thread.posts[post].user_id, "-password");
            thread.posts[post].user = user;
        } catch (err) {
            console.log(
                `unable to get user ${thread.posts[post].user_id} when getting post ${thread.posts[post]._id}: ${err}`
            )
        }
    }

    //Return the thread
    res.status(200).json({thread})
});

app.get("/thread", async (req, res) => {
    // No auth needed, auth is public/open
    // Get the threads
    let threads;
    try {
        threads = await Thread.find({});
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

app.delete("/thread/:id", async (req, res) => {
    // check if authed
    if (!req.user) {
      res.status(401).json({ mesage: "unauthenticated" });
      return;
    }
    console.log(`request to delete a single thread with id ${req.params.id}`);
  
    let thread;
  
    // get the thread to check if the current user is allow to delete it
    try {
      thread = await Thread.findById(req.params.id);
    } catch (err) {
      res.status(500).json({
        message: `failed to delete thread`,
        error: err,
      });
      return;
    }
  
    // check if we found it
    if (thread === null) {
      res.status(404).json({
        message: `thread not found`,
        thread_id: req.params.thread_id,
      });
      return;
    }
  
    // check if the current user made the post
    if (thread.user_id != req.user.id) {
      res.status(403).json({ mesage: "unauthorized" });
      return;
    }
  
    // delete the post
    try {
      await Thread.findByIdAndDelete(req.params.id);
    } catch (err) {
      res.status(500).json({
        message: `failed to delete post`,
        error: err,
      });
      return;
    }
  
    // return
    res.status(200).json(thread);
  });

app.post("/post", async (req, res) => {
    //check auth
    if (!req.user) {
        res.status(401).json({ message: "unauthenticated -- please login" });
        return;
    }
    //check to see if the thread is closed
    //first get thread by ID
    let gotThread;
    try {
        gotThread = await Thread.findById(req.body.thread_id);
        if (!gotThread) {
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
    //now check if it's closed
    if (gotThread.closed == false){
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
    } else {
        res.status(403).json({ message: "this thread is closed. could not post" })
    }
});

app.delete("/thread/:thread_id/post/:post_id", async (req, res) => {
    //check auth
    if (!req.user) {
        res.status(401).json({ message: "unauthenticated -- please login" });
        return;
    }
    let thread;
    //pull thread
    thread = await Thread.findOne({
        _id: req.params.thread_id,
        "posts._id": req.params.post_id,
    });
    //check that thread exists
    if (!thread) {
        res.status(404).json({
            message: `thread not found when deleting post`,
            thread_id: req.params.thread_id,
            post_id:req.params.post_id,
        });
        return;
    }
    //check that the post on the thread is owned by the requesting user
    for (let k in thread.posts) {
        if (thread.posts[k]._id == req.params.post_id) {
            if (req.user.id != thread.posts[k].user_id) {
                res.status(403).json({ message: "You do not own this post -- could not delete" });
                return;
            } else {
                //delete the post
                await Thread.findByIdAndUpdate(req.params.thread_id, {
                    $pull: {
                        posts: {
                            _id: req.params.post_id,
                        },
                    },
                });
                //return the deleted post
                res.status(200).json({ message: "successfullly deleted post", postDeleted: `${thread.posts[k].body}` });
                return;
            }
        }
    }
});

app.patch("/thread/:thread_id", async (req, res) => {
    //check auth
    if (!req.user) {
        res.status(401).json({ message: "unauthenticated -- please login" });
        return;
    }
    let thread;
    //get the thread
    try {
        thread = await Thread.findById(req.params.thread_id);
      } catch (err) {
        res.status(500).json({
          message: `failed to close thread`,
          error: err,
        });
        return;
      }
    
    // check if we found it
    if (thread === null) {
        res.status(404).json({
            message: `thread not found`,
            thread_id: req.params.thread_id,
        });
        return;
    }
    
    // check if the current user made the post
    if (thread.user_id != req.user.id) {
        res.status(403).json({ mesage: "unauthorized" });
        return;
    }
    //set the "closed" parameter = to the request
    const updatedBool = req.body;
    try {
        thread = await Thread.findByIdAndUpdate(req.params.thread_id, updatedBool);
        res.status(200).json({ message: "thread closed successfully" })
    } catch (err) {
        res.status(500).json({ message: "failed to close thread", error: err })
    }
})

module.exports = app