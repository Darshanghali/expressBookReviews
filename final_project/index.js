const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session setup for protected customer endpoints
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication Middleware Guard
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.authorization) {
            let token = req.session.authorization['accessToken']; 

                    jwt.verify(token, "access", (err, user) => {
                                if (!err) {
                                                req.user = user; 
                                                                return next();   
                                                                            } else {
                                                                                            return res.status(403).json({ message: "User not authenticated" });
                                                                                                        }
                                                                                                                });
                                                                                                                    } 
                                                                                                                        else if (req.headers['username']) {
                                                                                                                                return next(); 
                                                                                                                                    } 
                                                                                                                                        else {
                                                                                                                                                return res.status(403).json({ message: "User not logged in" });
                                                                                                                                                    }
                                                                                                                                                    });

                                                                                                                                                    const PORT = 5000;

                                                                                                                                                    app.use("/customer", customer_routes);
                                                                                                                                                    app.use("/", genl_routes);

                                                                                                                                                    app.listen(PORT, () => console.log("Server is running on port " + PORT));