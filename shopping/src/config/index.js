const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
    dotEnv.config({path: `./.env.${process.env.NODE_ENV}`});
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.APP_PORT,
    DB_URL: process.env.APP_MONGODB_URI,
    APP_SECRET: process.env.APP_SECRET
};