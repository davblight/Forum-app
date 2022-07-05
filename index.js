const app = require('./server/server')
const config = require('./config/config')
const mongo = require('./persist/mongo')

mongo.onConnect(() => {
    app.listen(config.http_port, () => {
        console.log(`Server is running on port ${config.http_port}`);
    });
});

mongo.connect()

