const express = require("express")
const db = require('../config/db')

const createBillingTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS billing (
            id INT AUTO_INCREMENT,
            uuid VARCHAR(255) NOT NULL,
            insid VARCHAR(255) NOT NULL UNIQUE,
            billedAmount VARCHAR(30) NOT NULL,
            paidThrough VARCHAR(255) NOT NULL,
            paymentDate DATE,
            billedDuration VARCHAR(25) NOT NULL,
            validTill DATE
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

module.exports = { createBillingTable };