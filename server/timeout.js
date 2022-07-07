const { Thread } = require("../persist/model")

let autoUpdate = async function () {
    let currentTime = new Date().getTime();
    let threads;
    try {
        threads = await Thread.find({});
    } catch (err) {
        console.log(err);
    }
    for (let i in threads) {
        if (currentTime - threads[i].updatedAt.getTime() > 30000){
            try {
            await Thread.findByIdAndUpdate(threads[i]._id, { closed: true })
            console.log("updatedAt:", threads[i].updatedAt.getTime())
            console.log("currentTime:", currentTime)
            console.log("closed:", threads[i].closed)
            console.log(" ")
            } catch (err) {
                console.log(err);
            }
        }
    }
}

let checkTimeout = (interval) => { setInterval(autoUpdate, interval) }

module.exports = checkTimeout