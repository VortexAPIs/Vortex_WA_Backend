const express = require("express")
const db = require('../config/db')


const createCompanyTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS companies (
            id INT AUTO_INCREMENT,
            uuid VARCHAR(255) NOT NULL UNIQUE,
            company_name VARCHAR(30) NOT NULL,
            address VARCHAR(255) NOT NULL,
            company_email VARCHAR(255) NOT NULL,
            contact_number VARCHAR(25) NOT NULL,
            company_website VARCHAR(255) NOT NULL
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

module.exports = { createCompanyTable };