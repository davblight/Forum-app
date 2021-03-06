const URL = "http://localhost:8080"
//"https://forum2022.codeschool.cloud"

var app = new Vue({
    el: "#app",
    data: {
        page: "login",
        emailInput: "",
        passwordInput: "",
        nameInput: "",
        error: "",
        threadNameInput: "",
        threadDescInput: "",
        threadCatInput: "",
        allThreads: [],
        postBodyInput: "",
        displayPosts: false,
        allPosts: [],
        threadIDForPosts: "",
    },  
    methods: {
        showSignUp: function () {
            this.page = "signup";
            this.emailInput = "";
            this.passwordInput = "";
            this.nameInput = "";
        },
        showLogin: function() {
            this.page = "login";
            this.emailInput = "";
            this.passwordInput = "";
            this.nameInput = "";
        }, 
        showPosts: function(threadID) {
            this.getPosts(threadID);
            this.displayPosts = !this.displayPosts
        },
        //USER LOGIN AND AUTHENTICATION LOGIC
        //GET /session - Ask the server if we are logged in
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                //method: "GET",
                credentials: "include" //every fetch request must have this inside of it or else you basically lose your cookie
            });
            // Are we logged in?
            if (response.status == 200){
                console.log("logged in");
                let data = await response.json();
                console.log(data);
                this.page = "home"

            } else if (response.status == 401) {
                console.log("Not logged in")
                let data = await response.json();
                console.log(data);
            
            } else {
                console.log("Something went wrong while getting /session", response.status, response)
            }

        },
        //POST /session - Attempt to login
        postSession: async function () {
            let loginCreds = {
                username: this.emailInput,
                password: this.passwordInput,
                // fullname: this.nameInput
            };
            let response = await fetch(`${URL}/session`, {
                method: "POST",
                body: JSON.stringify(loginCreds),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //parse response body
            let body = response.json();
            console.log(body)
            
            //check - was login successful?
            if (response.status == 201) {
                console.log("successful login attempt");
                
                //take the user to a home page
                this.page = "home"
            } else if (response.status = 401) {
                console.log("unsuccessful login attempt");
                //let the user know the attempt was unsuccessful
            } else {
                console.log("something went wrong while posting /session", response.status, response)
            }
        },

        //POST /user - Create new user
        postUser: async function () {
            let newUser = {fullname: this.nameInput, username: this.emailInput, password: this.passwordInput};
            let response = await fetch(`${URL}/users`, {
                method: "POST",
                body: JSON.stringify(newUser),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            let body = response.json();
            console.log(body);

            if (response.status == 201) {
                console.log("user successfully created");

            } else if (response.status = 404) {
                console.log("error creating user");

            } else {
                console.log("unknown error posting /users", response.status, response)
            }
        },

        //THREAD LOGIC
        getThread: async function () {
            let response = await fetch(`${URL}/thread`, {
                //method: "GET",
                credentials: "include" //every fetch request must have this inside of it or else you basically lose your cookie
            });
            if (response.status == 200){
                console.log("thread got");
                let data = await response.json();
                //console.log(data);
                this.allThreads = data;
                console.log(data)
            }
        },

        //Identify thread ID: TEST ID
        getThreadID: async function () {
            let response = await fetch(`${URL}/thread/:_id`, {
                credentials: "include"
            });
            let data = await response.json();
            console.log(data);
        },

        postThread: async function () {
            let newThread = {name: this.threadNameInput, description: this.threadDescInput, category: this.threadCatInput};
            let response = await fetch(`${URL}/thread`, {
                method: "POST",
                body: JSON.stringify(newThread),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            let body = response.json();
            console.log(body);
            this.getThread();
        },

        //Delete thread by ID
        deleteThread: async function (threadID) {
            let response = await fetch(`${URL}/thread/${threadID}`, {
                method: "DELETE",
                credentials: "include"
            });
            let body = response.json();
            console.log(body);
            this.getThread();
        },

        //POST LOGIC

        getPosts: async function (threadID) {
            let response = await fetch(`${URL}/thread/${threadID}/`, {
                //method: "GET",
                credentials: "include" //every fetch request must have this inside of it or else you basically lose your cookie
            });
            let data = await response.json();
            this.allPosts = data.posts;
            this.threadIDForPosts = data._id
        },
        //Post post:
        postPost: async function (threadID) {
            let newPost = {thread_id: threadID, body: this.postBodyInput}
            let response = await fetch(`${URL}/post`, {
                method: "POST",
                body: JSON.stringify(newPost),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            this.getPosts();
        },
        //Delete post:
        deletePost: async function (threadID, postID) {
            let response = await fetch(`${URL}/thread/${threadID}/post/${postID}`, {
                method: "DELETE",
                credentials: "include"
            });
            let body = await response.json();
            console.log(body);
        },

    },
    created: function () {
        this.getSession();
        this.getThread();
    }
})