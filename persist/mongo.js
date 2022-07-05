const mongoose = require("mongoose");
const db = mongoose.connection;

async function connect() {
    //let connectString = `mongodb+srv://${user}:${password}@${host}.f0la0.mongodb.net/?retryWrites=true&w=majority`;
    let connectString = `mongodb+srv://david:blight@cluster0.f0la0.mongodb.net/?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(connectString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log("error connecting to mongoose", err);
        throw "mongooose couldn't connect";
    }
}

function onConnect(callback) {
    db.once("open", () => {
        console.log("mongo connection open");
        callback();
    });
}

module.exports = {
    connect,
    onConnect,
}