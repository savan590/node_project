require("reflect-metadata");
const express = require("express");
const { createConnection } = require("typeorm");
const userRoutes = require("./routes/userRoutes");
const dotenv = require('dotenv')
dotenv.config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use("/api", userRoutes);

createConnection({
    "type": process.env.db_dialect,
    "host": process.env.db_host,
    "port": process.env.db_port,
    "username": process.env.db_user,
    "password": process.env.db_password,
    "database": process.env.db_name,
    "entities": [
        "model/*.js"
    ],
    "synchronize": true
}).then(async () => {
    app.listen(process.env.PORT, () => console.log("Server running on port 3000"));
}).catch(error => console.log(error));