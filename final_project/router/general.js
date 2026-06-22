const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// =========================================================================
// MODULAR BUSINESS LOGIC HELPERS (Decoupled Data Fetching)
// =========================================================================

/**
 * Async fetcher for the entire book catalog.
 */
const fetchAllBooks = () => {
    return new Promise((resolve) => resolve(books));
};

/**
 * Async fetcher for a single book by its ISBN key.
 */
const fetchBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject(new Error("Book not found"));
    });
};

/**
 * Async filter to aggregate books by a specific author name.
 */
const fetchBooksByAuthor = (authorName) => {
    return new Promise((resolve) => {
        const normalizedAuthor = authorName.toLowerCase();
        const keys = Object.keys(books);
        let matchingBooks = [];
        
        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === normalizedAuthor) {
                matchingBooks.push({
                    isbn: key,
                    author: books[key].author,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        });
        resolve(matchingBooks);
    });
};

/**
 * Async filter to aggregate books by a specific title.
 */
const fetchBooksByTitle = (titleParam) => {
    return new Promise((resolve) => {
        const normalizedTitle = titleParam.toLowerCase();
        const keys = Object.keys(books);
        let matchingBooks = [];

        keys.forEach((key) => {
            if (books[key].title.toLowerCase() === normalizedTitle) {
                matchingBooks.push({
                    isbn: key,
                    author: books[key].author,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        });
        resolve(matchingBooks);
    });
};

// =========================================================================
// PUBLIC USER MANAGEMENT ROUTES
// =========================================================================

// User registration endpoint
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some((user) => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists!" });
    }

    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// =========================================================================
// ASYNC/AWAIT ENDPOINTS (TASKS 10-13)
// =========================================================================

// Task 10: Get the list of books available in the shop
public_users.get('/', async function (req, res) {
    try {
        const availableBooks = await fetchAllBooks();
        return res.status(200).send(JSON.stringify({ books: availableBooks }, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error retrieving book list", error: error.message });
    }
});

// Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const bookDetails = await fetchBookByISBN(isbn);
        return res.status(200).send(JSON.stringify(bookDetails, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});
  
// Task 12: Get book details based on Author
public_users.get('/author/:author', async function (req, res) {
    const authorParam = req.params.author;
    
    if (!authorParam) {
        return res.status(400).json({ message: "Author parameter is missing" });
    }

    try {
        const results = await fetchBooksByAuthor(authorParam);
        if (results.length > 0) {
            return res.status(200).send(JSON.stringify(results, null, 4));
        } else {
            return res.status(404).json({ message: `No books found by author: ${authorParam}` });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error processing query", error: error.message });
    }
});

// Task 13: Get book details based on Title
public_users.get('/title/:title', async function (req, res) {
    const titleParam = req.params.title;

    if (!titleParam) {
        return res.status(400).json({ message: "Title parameter is missing" });
    }

    try {
        const results = await fetchBooksByTitle(titleParam);
        if (results.length > 0) {
            return res.status(200).send(JSON.stringify(results, null, 4));
        } else {
            return res.status(404).json({ message: `No books found with title: ${titleParam}` });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error processing query", error: error.message });
    }
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
