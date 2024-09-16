const express = require("express")
const db = require('../config/db')

const createTicketsTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticketID VARCHAR(255) NOT NULL UNIQUE,
            uuid VARCHAR(255) NOT NULL,
            insid VARCHAR(255) ,
            issueType VARCHAR(50) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            issue VARCHAR(700) NOT NULL,
            ticketDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            solution VARCHAR(2000),
            solvingDate TIMESTAMP NULL DEFAULT NULL
            
        );    
    `;
  
    db.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
    });
};
const createConversationTable = () => {
  const createConversTable = `
    CREATE TABLE IF NOT EXISTS conversations (
      conversationID INT PRIMARY KEY AUTO_INCREMENT,
      ticketID INT,
      userUUID VARCHAR(255),
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticketID) REFERENCES tickets(ticketID)
    );
  `;
  db.query(createConversTable, (err, results) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
  });
}


module.exports = { createTicketsTable, createConversationTable };