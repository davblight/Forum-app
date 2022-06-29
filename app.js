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
        }
    },
    methods: {
        //GET /session - Ask the server if we are logged in
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                //method: "GET",
                credentials: "include" //every fetch request must have this inside of it or else you basically lose your cookie
            });
            console.log(response);
        },
        //POST /session - Attempt to login

        //POST /user - Create new user
    },
    created: function () {
        this.getSession();
    }
})