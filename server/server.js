import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { generatePCBuild } from './apiHandlers/openaiHandler.js';
import { createPaymentIntent } from './apiHandlers/stripeHandler.js';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import bcryptjs from 'bcryptjs'; // Corrected typo
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import session from 'express-session';

//const bycryptjs = require('bcryptjs');

const route = express();
route.use(cors());
route.use(cookieParser());
route.use(express.json());
route.use(
  session({
    secret: 'JWT_SECRET', // Use a strong secret key
    resave: false, // Prevents resaving session if it's not modified
    saveUninitialized: false, // Don't save sessions that are not initialized
    cookie: {
      httpOnly: true, // Ensures cookies can't be accessed via JavaScript
      maxAge: 1000 * 60 * 60 * 24, // Cookie expiration (1 day)
    },
  })
);

sqlite3.verbose();
let db = new sqlite3.Database(process.env.Database ?? 'database.db');
console.log("Using database file:", process.env.Database ?? 'database.db');

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

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

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

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
  const { name, email, password } = req.body;
  console.log(password); 
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Bad email/password' });
    return;
  }
  hashPassword(password).then((hash) => {
    try{ 
      db.run("INSERT INTO User_Account (name, password, email, isAdmin) VALUES ($name, $password, $email, 0);", {$name: name, $email: email, $password: hash}, function (err) {
        if (err) throw err;
        res.status(201).json({id: this.lastID});
      });
    } catch (err) {
      res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
    }
  }); 
});



route.post('/login', async (req, res) => {
  const {email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Bad email/password' });
    return;
  }



  try {
    db.get("SELECT * FROM User_Account WHERE email = $email;", {$email: email}, (err, row) => {
      if(row == null){
        res.status(400).json({ error: process.env.DEBUG ? "No such username/password" : 'Failed' });
        return;
      }
      checkPassword(password, row.password).then((isMatch) => {
        if (err) res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
        else if (!row) res.status(400).json({ error: process.env.DEBUG ? "No such username/password" : 'Failed' });
        else if (!(isMatch)) res.status(400).json({ error: process.env.DEBUG ? "Password is incorrect" : 'Failed' });
        else {
          const user = { id: row.id, email: row.email };
          const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
          req.session.user = user;
          res.cookie('token', token, { httpOnly: true });
          res.status(200).json({ user: row });
        }
      });   
    });
  } catch (err) {
    res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
  }
});

// Example of a protected route
route.get('/cart', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

// Start the server
const port = process.env.PORT || 8000;
route.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});

//redundant?
/*
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
*/

/*
route.get('/listpart/components', async (req, res) => {
  const { componentType } = req.query;

  let query = 'SELECT part_name, brand, unit_price, slug FROM Computer_Part';

  if (componentType) {
    switch (componentType) {
      case 'cpu':
        query += ' WHERE EXISTS (SELECT 1 FROM Cpu WHERE Cpu.part_id = Computer_Part.part_id)';
        break;
      case 'gpu':
        query += ' WHERE EXISTS (SELECT 1 FROM Gpu WHERE Gpu.part_id = Computer_Part.part_id)';
        break;
      case 'storage':
        query += ' WHERE EXISTS (SELECT 1 FROM Storage_Device WHERE Storage_Device.part_id = Computer_Part.part_id)';
        break;
      case 'motherboard':
        query += ' WHERE EXISTS (SELECT 1 FROM Motherboard WHERE Motherboard.part_id = Computer_Part.part_id)';
        break;
      case 'case':
        query += ' WHERE EXISTS (SELECT 1 FROM Computer_case WHERE Computer_case.part_id = Computer_Part.part_id)';
        break;
      case 'cooling':
        query += ' WHERE EXISTS (SELECT 1 FROM Cooling WHERE Cooling.part_id = Computer_Part.part_id)';
        break;
      case 'all':
        // For 'all', just return all parts without filtering
        break;
      default:
        return res.status(400).send('Invalid component type');
    }
  }

  console.log('Executing query:', query);  // Log the query for debugging

  try {
    // Execute the query using db.all
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      // Send the results as JSON
      res.status(200).json(rows);
    });
  } catch (error) {
    // Handle server-side errors
    res.status(500).json({ error: "Server error", details: error.message });
  }

});

route.get('/listpart/search', async (req, res) => {
  const {searchQuery} = req.query; 
  let sqlQuery = 
  `
    SELECT part_name, brand, unit_price, slug FROM Computer_Part
    WHERE part_name LIKE '%${searchQuery}%';
  `;

  console.log('Executing query:', sqlQuery);  // Log the query for debugging

  try {
    // Execute the query using db.all
    db.all(sqlQuery, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      // Send the results as JSON
      res.status(200).json(rows);
    });
  } catch (error) {
    // Handle server-side errors
    res.status(500).json({ error: "Server error", details: error.message });
  } 
});
*/

//more general listpart function with ability to filter by component type, attributes within each component
//and search within the filtered results
route.get('/listpart', async (req, res) => {
  const{searchQuery, componentType, componentAttribute} = req.query;
  let query = 'SELECT part_name, brand, unit_price, slug FROM Computer_Part';

  if (componentType) {
    switch (componentType) {
      case 'cpu':
        if(componentAttribute){
          query += ` WHERE EXISTS (SELECT 1 FROM Cpu WHERE Cpu.part_id = Computer_Part.part_id AND Cpu.cores=${componentAttribute});`
        } else {
          query += ' WHERE EXISTS (SELECT 1 FROM Cpu WHERE Cpu.part_id = Computer_Part.part_id)';
        }
        break;
      case 'gpu':
        if(componentAttribute){
          query += ` WHERE EXISTS (SELECT 1 FROM Gpu WHERE Gpu.part_id = Computer_Part.part_id AND Gpu.vram="${componentAttribute}");`
        } else {
          query += ' WHERE EXISTS (SELECT 1 FROM Gpu WHERE Gpu.part_id = Computer_Part.part_id)';
        }
        break;
      case 'storage':
        if(componentAttribute){
          query += ` WHERE EXISTS (SELECT 1 FROM Storage_Device WHERE Storage_Device.part_id = Computer_Part.part_id AND Storage_Device.memory="${componentAttribute}");`
        } else {
          query += ' WHERE EXISTS (SELECT 1 FROM Storage_Device WHERE Storage_Device.part_id = Computer_Part.part_id)';
        }
        break;
      case 'motherboard':
        if(componentAttribute){
          query += ` WHERE EXISTS (SELECT 1 FROM Motherboard WHERE Motherboard.part_id = Computer_Part.part_id AND Motherboard.form_factor="${componentAttribute}");`
        } else {
          query += ' WHERE EXISTS (SELECT 1 FROM Motherboard WHERE Motherboard.part_id = Computer_Part.part_id)';
        }
        break;
      case 'case':
        if(componentAttribute){
          query += ` WHERE EXISTS (SELECT 1 FROM Computer_case WHERE Computer_case.part_id = Computer_Part.part_id AND Computer_case.size=${componentAttribute});`
        } else {
          query += ' WHERE EXISTS (SELECT 1 FROM Computer_case WHERE Computer_case.part_id = Computer_Part.part_id)';
        }
        break;
      case 'cooling':
        if(componentAttribute){
          query += ` WHERE EXISTS (SELECT 1 FROM Cooling WHERE Cooling.part_id = Computer_Part.part_id AND Cooling.method="${componentAttribute}");`
        } else {
          query += ' WHERE EXISTS (SELECT 1 FROM Cooling WHERE Cooling.part_id = Computer_Part.part_id)';
        }
        break;
      case 'all':
        // For 'all', just return all parts without filtering
        //no need to check for componentAttribute since component type isn't specified
        break;
      default:
        return res.status(400).send('Invalid component type');
    }
  }

  //searches within filtered results
  if(searchQuery && componentType != 'all') {
    query += `
    AND part_name LIKE '%${searchQuery}%';
    `;
  }

  if(searchQuery && componentType == 'all') {
    query += `
    WHERE part_name LIKE '%${searchQuery}%';
    `;
  }

  console.log('Executing query:', query);  // Log the query for debugging

  try {
    // Execute the query using db.all
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      // Send the results as JSON
      res.status(200).json(rows);
    });
  } catch (error) {
    // Handle server-side errors
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

route.get('/listprebuilt', (req, res) => {
  try {
    db.all("SELECT build_name, build_price FROM Pre_Build", [], (err, rows) => {
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

async function checkPassword(password, hash) {
  try{
    const isMatch = await bcryptjs.compare(password, hash); 
    return isMatch;
  }catch(error){
    console.error('Error checking password:', error);
    throw error;
  }
}

async function hashPassword(password){ 
  const saltRounds = 10; 
  try {
    const hash = await bcryptjs.hash(password, saltRounds); 
    if (typeof hash !== 'string') {
      throw new Error('Hash is not a string');
    }
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; 
  }
}