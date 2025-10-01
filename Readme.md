# 🚨 Vulnerable Web Application

### ⚠️ FOR EDUCATIONAL PURPOSES ONLY ⚠️

This is a deliberately insecure web application designed for security training, educational purposes, and penetration testing practice. It provides a safe and controlled environment for developers, students, and security enthusiasts to learn about and identify common web application vulnerabilities.

**DO NOT deploy this application on public servers or in production environments.** The creators assume no liability for any misuse of this application.

-----

## ✨ Features

This application is built with **Node.js**, **Express**, and **MySQL** on the backend, and serves static HTML, CSS, and JavaScript on the frontend. It simulates a simple web application with a login system and several features, each containing a specific, exploitable security flaw.

  * **User Authentication**: A basic login system to access the protected parts of the application.
  * **Interactive Vulnerability Pages**: Each vulnerability has its own dedicated page with a description, exploitation instructions, and a functional component to test the flaw.
  * **Dynamic Content**: The application uses server-side logic to dynamically inject content (like an account balance) into the HTML pages.

-----

## 🔐 Implemented Vulnerabilities

The application includes the following intentionally implemented vulnerabilities for you to explore and exploit:

### 1\. **OS Command Injection**

  * **Description**: The "Ping Tool" allows users to execute arbitrary system commands on the server by injecting them into the ping utility.
  * **Location**: `/protected/command-injection.html`

### 2\. **SQL Injection (SQLi)**

  * **Description**: The login form is vulnerable to SQL injection, allowing attackers to bypass authentication or manipulate database queries directly. The application concatenates user input directly into the SQL query.
  * **Location**: `/protected/sql-injection.html`

### 3\. **Cross-Site Scripting (XSS) - Reflected (GET)**

  * **Description**: The search feature is vulnerable to reflected XSS. A malicious script can be injected into the URL, which is then executed by the victim's browser when they visit the link.
  * **Location**: `/protected/xss-get.html`

### 4\. **Cross-Site Scripting (XSS) - Reflected (POST)**

  * **Description**: The comment submission form is vulnerable to reflected XSS via a POST request. The server includes un-sanitized user input from the form directly into the response page.
  * **Location**: `/protected/xss-post.html`

### 5\. **Cross-Site Request Forgery (CSRF) - GET**

  * **Description**: A sensitive action (transferring money) is performed via a simple GET request. An attacker can craft a malicious link or image tag that, when viewed by a logged-in user, will execute the transaction without their consent.
  * **Location**: `/protected/csrf-get.html`

### 6\. **Cross-Site Request Forgery (CSRF) - POST**

  * **Description**: The bank transfer form performs a state-changing action via a POST request without any anti-CSRF tokens, making it vulnerable to exploitation from a malicious external website.
  * **Location**: `/protected/csrf-post.html`

### 7\. **Server-Side Request Forgery (SSRF)**

  * **Description**: The "URL Fetcher Tool" allows an attacker to make the server send requests to internal network resources, external systems, or local files, potentially bypassing firewalls and exposing sensitive information.
  * **Location**: `/protected/ssrf.html`

-----

## 🚀 Getting Started

Follow these instructions to get the application running on your local machine for testing and educational purposes.

### Prerequisites

  * **Node.js**: Ensure you have Node.js installed (version 18.0.0 or higher).
  * **MySQL**: You need a running MySQL server.

### Installation & Setup

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Vikas2171/vulnerable-website.git
    cd vulnerable-website
    ```

2.  **Install Dependencies**

    Navigate to the `server` directory and install the required npm packages.

    ```bash
    cd server
    npm install
    ```

3.  **Set Up the Database**

    **a.**  Connect to your MySQL server.

    **b.**  Create a new database for the application.
    ` sql CREATE DATABASE vulnerable_app;  `
    
    **c.**  Use the new database.
    ` sql USE vulnerable_app;  `

    **d.**  Create the `users` table.
    ` sql CREATE TABLE users ( id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL );  `

    **e.**  Insert a default user for testing.
    ` sql INSERT INTO users (username, password) VALUES ('admin', 'admin123');  `

4.  **Configure Database Credentials**

    Open the `server/server.js` file and update the `db` connection object with your MySQL username and password.

    ```javascript
    // vulnerable-website/server/server.js

    const db = mysql.createConnection({
        host: 'localhost',
        user: 'YOUR_MYSQL_USERNAME',      // <-- Add your username here
        password: 'YOUR_MYSQL_PASSWORD',  // <-- Add your password here
        database: 'vulnerable_app'
    });
    ```

5.  **Run the Server**

    From the `server` directory, start the application.

    ```bash
    node server.js
    ```

    The server will be running at `http://localhost:3000`.

-----

## 📝 Usage

1.  Open your web browser and navigate to `http://localhost:3000`.
2.  Log in using the default credentials:
      * **Username**: `admin`
      * **Password**: `admin123`
3.  Once logged in, you will be directed to the home page where you can navigate to and explore each of the different vulnerabilities.
