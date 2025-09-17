const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/customer", proxy("http://localhost:5001", {
    proxyErrorHandler: (err, res, next) => {
        console.error("Customer service proxy error:", err);
        res.status(502).send("Customer service unavailable");
    }
}));

app.use("/shopping", proxy("http://localhost:5002", {
    proxyErrorHandler: (err, res, next) => {
        console.error("Shopping service proxy error:", err);
        res.status(502).send("Shopping service unavailable");
    }
}));

app.listen(5000, () => {
    console.log("Gateway is Listening to http://localhost:5000")
});