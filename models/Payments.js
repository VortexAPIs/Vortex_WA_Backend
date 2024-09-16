const express = require("express")
const db = require('../config/db')


const createPaymentsTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT,
            insid VARCHAR(255) NOT NULL PRIMARY KEY,
            paymentID VARCHAR(255) NOT NULL,
            orderID VARCHAR(255) NOT NULL,
            amount FLOAT NOT NULL,
            currency VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            method VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            card_vpa_wallet_id VARCHAR(255),
            email VARCHAR(255),
            contact VARCHAR(255),
            transaction_id VARCHAR(255),
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

module.exports = { createPaymentsTable }; 