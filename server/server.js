import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';
import mysql from 'mysql2';
import session from 'express-session';

const app = express();
const PORT = 3000;

// Helper to get correct directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Middleware Setup
app.use(session({
    secret: 'a-very-secret-key-that-should-be-in-an-env-file',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// --- Database Connection ---
const db = mysql.createConnection({
    host: 'localhost',
    user: '',   // write your username of mysql
    password: '',   // give your password
    database: 'vulnerable_app'  // create a database named vulnerable_app
});

// =====================
//  PUBLIC ROUTES
// =====================

// Serve only "public" folder (login page + assets)
app.use('/', express.static(path.join(__dirname, '../client/public')));

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        db.query(query, [username, password], (err, results) => {
            if (results && results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.balance = 1000;
                res.redirect('/protected/home.html');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
        });
    } else {
        res.send('Please enter Username and Password!');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/'); // back to login page
    });
});

// =====================
//  AUTH & NO-CACHE MIDDLEWARE
// =====================
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (!req.session.loggedin) {
        return res.redirect('/');
    }
    next();
});

// =====================
//  PROTECTED ROUTES
// =====================

// Serve static files from "protected" folder
// app.use('/protected', express.static(path.join(__dirname, '../client/protected')));

// Middleware to dynamically serve and inject balance into protected HTML pages
app.use((req, res, next) => {
    // Check if the request is for an HTML file
    if (path.extname(req.path) === '.html') {
        const filePath = path.join(__dirname, '../client', req.path);
        fs.readFile(filePath, 'utf8', (err, html) => {
            if (err) {
                return next(); // File not found, pass to 404 handler
            }
            // Inject the account balance into the HTML
            const balance = req.session.balance || 0;
            const modifiedHtml = html.replace(/__ACCOUNT_BALANCE__/g, balance.toFixed(2));
            res.send(modifiedHtml);
        });
    } else {
        next(); // Not an HTML file, continue to other routes
    }
});

// Vulnerability endpoints
app.post('/command-injection-vulnerable', (req, res) => {
    const userInput = req.body.host || '';
    const command = `ping -c 4 ${userInput}`;
    exec(command, (error, stdout, stderr) => {
        const output = error ? `Error: ${error.message}` : (stdout || stderr);
        const vulnerableHtmlResponse = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Command Injection Result</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header><div class="container"><h1>🚨 Command Injection Result</h1></div></header>
                <main>
                    <div class="container vulnerability-page">
                        <div class="result-box">
                            <h3>Command Output for '${userInput}':</h3>
                            <pre>${output}</pre>
                        </div>
                        <a href="/protected/command-injection.html" class="btn" style="margin-top: 20px;">Go Back</a>
                    </div>
                </main>
            </body>
            </html>
        `;
        res.send(vulnerableHtmlResponse);
    });
});

app.get('/xss-get-vulnerable', (req, res) => {
    const searchTerm = req.query.search || '';
    const vulnerableHtmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Search Results</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header><div class="container"><h1>🚨 Search Results</h1></div></header>
            <main>
                <div class="container vulnerability-page">
                    <div class="result-box">
                        <h3>Search Results for:</h3>
                        <div class="vulnerable-output">${searchTerm}</div>
                    </div>
                    <a href="/protected/xss-get.html" class="btn" style="margin-top: 20px;">Go Back</a>
                </div>
            </main>
        </body>
        </html>
    `;
    res.send(vulnerableHtmlResponse);
});

app.post('/xss-post-vulnerable', (req, res) => {
    const comment = req.body.comment || '';
    const vulnerableHtmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Comment Submitted</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header><div class="container"><h1>🚨 Comment Submitted</h1></div></header>
            <main>
                <div class="container vulnerability-page">
                    <div class="result-box">
                        <h3>Your Comment:</h3>
                        <div class="comment-display vulnerable-output">${comment}</div>
                        <small><em>Comment posted successfully!</em></small>
                    </div>
                    <a href="/protected/xss-post.html" class="btn" style="margin-top: 20px;">Go Back</a>
                </div>
            </main>
        </body>
        </html>
    `;
    res.send(vulnerableHtmlResponse);
});

app.get('/csrf-get-action', (req, res) => {
    const amount = parseFloat(req.query.amount) || '0';
    req.session.balance = (req.session.balance || 0) - amount;
    const recipient = req.query.recipient || 'unknown';
    const confirmationHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Transfer Complete</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header><div class="container"><h1>🚨 Transfer Complete</h1></div></header>
            <main>
                <div class="container vulnerability-page">
                    <div class="result-box success">
                        <h3>Transfer Successful!</h3>
                        <div class="transfer-details">
                            <p><strong>Amount:</strong> $${amount}</p>
                            <p><strong>Recipient:</strong> ${recipient}</p>
                        </div>
                    </div>
                    <a href="/protected/csrf-get.html" class="btn" style="margin-top: 20px;">Go Back</a>
                </div>
            </main>
        </body>
        </html>
    `;
    res.send(confirmationHtml);
});

app.post('/csrf-post-action', (req, res) => {
    const amount = parseFloat(req.query.amount) || '0';
    req.session.balance = (req.session.balance || 0) - amount;
    const recipient = req.body.recipient || 'unknown';
    const confirmationHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Transfer Complete</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header><div class="container"><h1>🚨 Transfer Complete</h1></div></header>
            <main>
                <div class="container vulnerability-page">
                    <div class="result-box success">
                        <h3>Transfer Successful!</h3>
                        <div class="transfer-details">
                            <p><strong>Amount:</strong> $${amount}</p>
                            <p><strong>Recipient:</strong> ${recipient}</p>
                        </div>
                    </div>
                    <a href="/protected/csrf-post.html" class="btn" style="margin-top: 20px;">Go Back</a>
                </div>
            </main>
        </body>
        </html>
    `;
    res.send(confirmationHtml);
});

app.post('/ssrf-action', async (req, res) => {
    const url = req.body.url;
    let responseContent = '';
    let errorContent = '';
    try {
        const response = await fetch(url);
        const content = await response.text();
        responseContent = content.substring(0, 1000);
    } catch (error) {
        errorContent = error.message;
    }
    const resultHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>SSRF Result</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header><div class="container"><h1>🚨 SSRF Result</h1></div></header>
            <main>
                <div class="container vulnerability-page">
                    ${errorContent ? `
                    <div class="result-box error">
                        <h3>Error fetching URL: ${url}</h3>
                        <pre>${errorContent}</pre>
                    </div>
                    ` : `
                    <div class="result-box">
                        <h3>Response from: ${url}</h3>
                        <pre>${responseContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
                        ${responseContent.length >= 1000 ? '<p><em>Content truncated...</em></p>' : ''}
                    </div>
                    `}
                    <a href="/protected/ssrf.html" class="btn" style="margin-top: 20px;">Go Back</a>
                </div>
            </main>
        </body>
        </html>
    `;
    res.send(resultHtml);
});

app.post('/sql-injection-action', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    db.query(query, (err, results) => {
        let message = '';
        if (err) {
            message = `SQL Error: ${err.message}`;
        } else if (results && results.length > 0) {
            message = `Login successful! Welcome ${results[0].username}`;
        } else {
            message = 'Login failed - invalid credentials';
        }
        const resultHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Login Result</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header><div class="container"><h1>🚨 Login Result</h1></div></header>
                <main>
                    <div class="container vulnerability-page">
                        <div class="result-box ${message.includes('successful') ? 'success' : ''}">
                            <h3>Login Status:</h3>
                            <p>${message}</p>
                        </div>
                        <div class="query-box">
                            <h3>Executed Query:</h3>
                            <pre>${query}</pre>
                        </div>
                        <a href="/protected/sql-injection.html" class="btn" style="margin-top: 20px;">Go Back</a>
                    </div>
                </main>
            </body>
            </html>
        `;
        res.send(resultHtml);
    });
});

// --- Catch-all for 404 ---
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
});

// --- Server Start ---
db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
});
