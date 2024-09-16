const express = require("express")
const db = require('../config/db')

const createOTPTokenTable = () => {
    const createTableQuery = `
        CREATE TABLE otp_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uuid VARCHAR(50) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            token VARCHAR(500) NOT NULL,
            is_used BOOLEAN DEFAULT FALSE,
            expires_at DATETIME NOT NULL
        );
    `;

    db.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
    });
};

module.exports = { createOTPTokenTable }; 
