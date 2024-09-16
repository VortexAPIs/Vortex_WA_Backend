const express = require("express")
const db = require('../config/db')


const createInstanceTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS instances (
            id INT AUTO_INCREMENT,
            uuid VARCHAR(255) NOT NULL,
            insid VARCHAR(255) NOT NULL PRIMARY KEY,
            instanceName VARCHAR(255) NOT NULL,
            authenticated BOOLEAN DEFAULT FALSE,
            api_key VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            wid VARCHAR(20) NULL,
            trial BOOLEAN DEFAULT TRUE,
            billingDate DATE,
            validTill DATE,
            status VARCHAR(255),
            INDEX(id)
        );    
    `;
  
    db.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
    //   console.log('Table created successfully!');
    //   db.end(); // Close connection after creating the table
    });
  };

module.exports = { createInstanceTable }; 