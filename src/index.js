const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { Client } = require('pg');
const dotenv = require('dotenv');

app.use(cors());
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*"},
});

const dataset_qry = ("SELECT DATE_PART('Year',datetime) AS dt_year, " +
                    "DATE_PART('Month',datetime) AS dt_month, " +
                    "DATE_PART('Day',datetime) AS dt_day, " +
                    "DATE_PART('Hour',datetime) AS dt_hour, " +
                    "body->'utc_datetime' AS utc_datetime, " +
                    "DATE_PART('Year',(body->>'utc_datetime')::timestamp) AS utc_year, " +
                    "DATE_PART('Month',(body->>'utc_datetime')::timestamp) AS utc_month, " +
                    "DATE_PART('Day',(body->>'utc_datetime')::timestamp) AS utc_day, " +
                    "DATE_PART('Hour',(body->>'utc_datetime')::timestamp) AS utc_hour, " +
                    "body->'fearandgreed_value' AS fearandgreed_value, " +
                    "body->'bitcoin_price' AS bitcoin_price, " +
                    "body->'bitcoin_market_cap' AS bitcoin_market_cap, " +
                    "body->'bitcoin_volume_24h' AS bitcoin_volume_24h, " +
                    "body->'fearandgreed_value_classification' AS fearandgreed_value_classification " +
                    "FROM dataset.bitcoin_samples " +
                    "ORDER BY datetime ASC ")

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
})
client.connect()
const query = client.query('LISTEN new_update_sampler')

//*********************************** */

io.on("connection", async (socket) => {
    //New Connection
    console.log(`User connected ${socket.id}`);
    const response = await client.query(dataset_qry)
    socket.emit("init_body", response.rows);
    //Postgresql Trigger Event
    client.on('notification', async () => {
        const response = await client.query(dataset_qry)
        socket.emit("init_body", response.rows);
    })
});


server.listen(process.env.BACK_PORT, () => { console.log(`Listening on *:${process.env.BACK_PORT}`); });