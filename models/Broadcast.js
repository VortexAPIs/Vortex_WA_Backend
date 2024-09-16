const express = require("express")
const db = require('../config/db')

const createBroadcarstTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS broadcast (
            id INT AUTO_INCREMENT,
            uuid LONGTEXT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            description LONGTEXT NOT NULL,
            issueDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            file LONGBLOB
            status VARCHAR(50) NOT NULL,
            sentTo INT,
            readBy INT
        )
    `;

    db.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
    });
};

module.exports = {createBroadcarstTable}


