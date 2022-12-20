const express = require("express");
const app = express();

app.use(express.json());

app.post("/login", (req, res) => {
    console.log("Login router");
    res.json({ msg: "Login Endpoint" });
});

app.get("/home", (req, res) => {
    console.log(
        "Protected endpoint that only authorized users can access");
    res.json({ msg: "Home Endpoint" });
});

app.listen(8000, () => console.log("Listening on 8000"));

require("dotenv").config();
const jwt = require("jsonwebtoken");

// Modify the login route as below
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
        const token = jwt.sign({ username },
            process.env.JWT_SECRET_KEY, {
            expiresIn: 86400
        });
        return res.json({ username, token, msg: "Login Success" });
    }
    return res.json({ msg: "Invalid Credentials" });
});
const verifyTokenMiddleware = (req, res, next) => {
    const { token } = req.body;
    if (!token) return res.status(403).json({
        msg: "No token present"
    });
    try {
        const decoded = jwt.verify(token,
            process.env.JWT_SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({
            msg: "Invalid Token"
        });
    }
    next();
};
// Modify the home endpoint as below
// to use the verifyTokenMiddleware
app.get("/home", verifyTokenMiddleware, (req, res) => {
    const { user } = req;
    res.json({ msg: `Welcome ${user.username}` });
});