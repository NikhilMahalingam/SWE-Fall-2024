import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { generatePCBuild } from './apiHandlers/openaiHandler.js';
import { createPaymentIntent } from './apiHandlers/stripeHandler.js';
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJ_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const route = express();
sqlite3.verbose();
let db = new sqlite3.Database(process.env.Database ?? 'database.db');

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
    const result = await createUserWithEmailAndPassword(auth, email, password);
    res.status(201).json(result);
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
    const result = await signInWithEmailAndPassword(auth, email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
  }
});

// Start the server
const port = process.env.PORT || 8000;
route.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
