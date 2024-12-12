import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { generatePCBuild } from './apiHandlers/openaiHandler.js';
import { createPaymentIntent } from './apiHandlers/stripeHandler.js';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';


const route = express();
route.use(cors());
sqlite3.verbose();
let db = new sqlite3.Database(process.env.Database ?? 'database.db');
console.log("Using database file:", process.env.Database ?? 'database.db');

// Function to initiate the SQLite database connection
function initiateDBConnection() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(process.env.Database ?? 'database.db', (err) => {
      if (err) {
        return reject(err);
      }

      fs.readFile("migrations/schema.sql", 'utf8', (err, sql) => {
        if (err) {
          return reject(err);
        }

        db.exec(sql, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  });
}

// Middleware
route.use(express.json());
route.use(express.urlencoded({ extended: true }));
route.use(express.static("../client/build"));

// Routes
route.post('/generate-pc-build', async (req, res) => {
  try {
    const { description } = req.body;
    const pcBuild = await generatePCBuild(description);
    res.status(200).json({ pcBuild });
  } catch (error) {
    res.status(500).json({ message: 'Error generating PC build', error: error.toString() });
  }
});

route.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const paymentIntent = await createPaymentIntent(amount);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Bad email/password' });
    return;
  }

  try {
    db.run("INSERT INTO User_Account (name, password, email, isAdmin) VALUES ($email, $password, $email, 0);", {$email: email, $password: password}, function (err) {
      if (err) throw err;
      res.status(201).json({id: this.lastID});
    });
  } catch (err) {
    res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
  }
});

route.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Bad email/password' });
    return;
  }

  try {
    db.get("SELECT * FROM User_Account WHERE name = $email AND password = $password;", {$email: email, $password: password}, (err, row) => {
      if (err) throw err;
      console.log(row);
      if (!row) throw Error("no such username/password combination");
      res.status(200).json({user: row});
    });
  } catch (err) {
    res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
  }
});

// Start the server
const port = process.env.PORT || 8000;
route.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});

route.get('/listpart', (req, res) => {
  try {
    db.all("SELECT part_name, brand, unit_price, slug FROM Computer_Part", [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: "Database error", details: err.message });
        return;
      }
      res.status(200).json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

route.get("*", (req, res)=> {
  res.sendFile(path.resolve('..', 'client', 'build', 'index.html'));
});