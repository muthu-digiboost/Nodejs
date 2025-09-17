const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const { CreateChannel } = require('./utils');
const { customer } = require('./api');

const StartServer = async () => {
    const app = express();
    await databaseConnection();
    const channel = await CreateChannel();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(express.static(__dirname + '/public'));
    customer(app, channel);

    app.get('/', (req, res) => res.json({
        message: 'Shopping API is up'
    }));

    return {
        app,
        channel
    }
}

StartServer().then(({app, channel}) => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
        .on('error', (err) => {
            console.log(err);
            process.exit();
        })
        .on('close', () => {
            channel.close();
        });
});