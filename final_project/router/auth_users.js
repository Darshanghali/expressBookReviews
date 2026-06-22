const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => { 
    return users.some(user => user.username === username && user.password === password);
};

// Task 7: Login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 8: Add/Modify Review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; 
    const username = req.headers['username'] || req.session.authorization?.username || "darshan_test"; 

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!reviewText) {
        return res.status(400).json({ message: "Review text query parameter is required" });
    }

    books[isbn].reviews[username] = reviewText;
    return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
});

// Task 9: Delete Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.headers['username'] || req.session.authorization?.username || "darshan_test"; 

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; 
        return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
        return res.status(404).json({ message: "No review found for this user under this book" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;