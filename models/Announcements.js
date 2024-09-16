const express = require("express")
const db = require('../config/db')

const createAnnouncementsTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT,
            uuid VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            description LONGTEXT NOT NULL,
            file LONGBLOB,
            issueDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) NOT NULL,
            readDate DATETIME 
        )
    `;

    db.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
    });
};

module.exports = {createAnnouncementsTable}


