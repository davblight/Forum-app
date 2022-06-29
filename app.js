const URL = "https://forum2022.codeschool.cloud"

var app = new Vue({
    el: "#app",
    data: {
        signUp: false,
        emailInput: "",
        passwordInput: "",
        nameInput: "",
    },  
    methods: {
        showSignUp: function () {
            this.signUp = true;
            this.emailInput = "";
            this.passwordInput = "";
            this.nameInput = "";
        },
        showLogin: function() {
            this.signUp = false;
            this.emailInput = "";
            this.passwordInput = "";
            this.nameInput = "";
        }, 
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
            let loginCreds = {username: this.emailInput, password: this.passwordInput};
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
            let response = await fetch(`${URL}/user`, {
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
        }
    },
    created: function () {
        this.getSession();
    }
})