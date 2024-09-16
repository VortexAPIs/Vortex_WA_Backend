// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const db = require('./config/db');
const routes = require('./routes');
const { initializeSocket } = require('./sockets');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

const cron = require('./schedulers/instanceSchedule')
cron.updateInstance()

// Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

routes(app, io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
