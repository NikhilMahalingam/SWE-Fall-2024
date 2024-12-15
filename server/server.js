import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { generatePCBuild } from './apiHandlers/openaiHandler.js';
import { createPaymentIntent } from './apiHandlers/stripeHandler.js';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import bycryptjs from 'bcryptjs';
import { sleep } from 'openai/core.mjs';

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

//cart endpoints
route.get('/cart', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  const findOrderSql = `
    SELECT order_id FROM Parts_Order 
    WHERE user_id = $user_id AND status = 'In Cart'
    ORDER BY order_id DESC LIMIT 1
  `;
  db.get(findOrderSql, { $user_id: user_id }, (err, orderRow) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!orderRow) {
   
      return res.json([]); 
    }

    const sql = `
      SELECT Computer_Part.part_id, Computer_Part.part_name, 
             Computer_Part.brand, Computer_Part.unit_price,
             Consists.quantity
      FROM Consists
      INNER JOIN Computer_Part ON Consists.part_id = Computer_Part.part_id
      WHERE Consists.order_id = $order_id
    `;
    db.all(sql, { $order_id: orderRow.order_id }, (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows);
    });
  });
});

route.post('/cart/add', (req, res) => {
  const { user_id, part_id } = req.body;
  if (!user_id || !part_id) {
    return res.status(400).json({ error: "Missing user_id or part_id." });
  }
  const findOrderSql = `
    SELECT order_id FROM Parts_Order 
    WHERE user_id = $user_id AND status = 'In Cart'
    ORDER BY order_id DESC LIMIT 1
  `;
  db.get(findOrderSql, { $user_id: user_id }, (err, orderRow) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!orderRow) {
  
      const createOrderSql = `
        INSERT INTO Parts_Order (date, status, user_id)
        VALUES (datetime('now'), 'In Cart', $user_id)
      `;
      db.run(createOrderSql, { $user_id: user_id }, function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        const newOrderId = this.lastID;
        addOrUpdateConsists(newOrderId, part_id, 1, res);
      });
    } else {
      addOrUpdateConsists(orderRow.order_id, part_id, 1, res);
    }
  });
});

function addOrUpdateConsists(order_id, part_id, quantity, res) {
  const checkConsistsSql = `
    SELECT quantity FROM Consists 
    WHERE order_id = $order_id AND part_id = $part_id
  `;
  db.get(checkConsistsSql, { $order_id: order_id, $part_id: part_id }, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {

      const newQuantity = row.quantity + quantity;
      db.run(
        "UPDATE Consists SET quantity = $quantity WHERE order_id = $order_id AND part_id = $part_id",
        { $quantity: newQuantity, $order_id: order_id, $part_id: part_id },
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true, message: 'Quantity updated' });
        }
      );
    } else {
      db.run(
        "INSERT INTO Consists (part_id, order_id, quantity) VALUES ($part_id, $order_id, $quantity)",
        { $part_id: part_id, $order_id: order_id, $quantity: quantity },
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true, message: 'Part added to cart' });
        }
      );
    }
  });
}

route.delete('/cart/remove', (req, res) => {
  const { user_id, part_id } = req.body;

  if (!user_id || !part_id) {
    return res.status(400).json({ error: "Missing user_id or part_id." });
  }
  const findOrderSql = `
    SELECT order_id FROM Parts_Order 
    WHERE user_id = $user_id AND status = 'In Cart'
    ORDER BY order_id DESC LIMIT 1
  `;
  db.get(findOrderSql, { $user_id: user_id }, (err, orderRow) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!orderRow) {
      return res.status(400).json({ error: "No active cart found for user" });
    }

    const deleteSql = `
      DELETE FROM Consists
      WHERE order_id = $order_id AND part_id = $part_id
    `;
    db.run(deleteSql, { $order_id: orderRow.order_id, $part_id: part_id }, function (deleteErr) {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });
      if (this.changes === 0) {
        return res.status(400).json({ error: "Item not found in cart" });
      }
      res.json({ success: true, message: 'Part removed from cart' });
    });
  });
});





route.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log(password); 
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Bad email/password' });
    return;
  }

  if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    res.status(400).json({ error: 'Email not in proper format' });
    return;
  }

  try {
    db.run("INSERT INTO User_Account (name, password, email, isAdmin) VALUES ($name, $password, $email, 0);", {$name: name, $email: email, $password: password}, function (err) {
      if (err) throw err;
      if (!this.changes) res.status(400).json({ error: 'Bad email/password' });
      else res.status(201).json({id: this.lastID});
    });
  } catch (err) {
    res.status(400).json({ error: process.env.DEBUG ? err.toString() : 'Failed' });
  }
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
        else res.status(200).json({user: row});
      });   
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

//more general listpart function with ability to filter by component type, attributes within each component
//and search within the filtered results
route.get('/listpart', async (req, res) => {
  const{searchQuery, componentType, componentAttribute} = req.query;
  let query = 'SELECT part_id, part_name, brand, unit_price, slug FROM Computer_Part';

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
    db.all("SELECT * FROM Pre_Build P JOIN Uses U ON P.build_id = U.build_id JOIN Computer_Part CP ON CP.part_id = U.part_id ORDER BY P.build_id", [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: "Database error", details: err.message });
        return;
      }
      console.log(rows);
      let preBuilds = {};
      for (const row of rows) {
        const id = `${row.build_id}`;
        if (!preBuilds[id]) {
          preBuilds[id] = {
            build_id: row.build_id,
            build_name: row.build_name,
            parts: [],
            build_price: 0,
          };
        }
        preBuilds[id].parts.push({
          part_id: row.part_id,
          part_name: row.part_name,
          unit_price: row.unit_price
        });
        preBuilds[id].build_price += row.unit_price;
      }
      console.log(preBuilds);
      res.status(200).json(preBuilds);
      });
      
      // console.log(rows);
      // preBuildWithParts = rows.map((row) => {
      //   let parts = null;
      //   db.all(`SELECT * FROM Uses WHERE build_id = ${row.build_id}`, [], (err, rows) => {
      //     if (err) {
      //       res.status(500).json({ error: "Database error", details: err.message });
      //       return;
      //     }
      //     console.log("use rows:", rows);
      //     parts = rows;
      //     console.log("parts:", parts);
      //   });
      //   console.log("Outside use query", parts);
      //   setTimeout(() => {return {
      //     ...row,
      //     parts: parts,
      //   }}, 5000);
      //   // res.status(200).json(preBuildWithParts);
      // });
      // // console.log("After appending parts", preBuildWithParts);
      // setTimeout(() => {
      //   console.log("After appending parts", preBuildWithParts);
      //   res.status(200).json(preBuildWithParts);
      // }, 1000);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});
route.get("*", (req, res)=> {
  res.sendFile(path.resolve('..', 'client', 'build', 'index.html'));
});

async function checkPassword(password, hash) {
  try{
    const isMatch = await bycryptjs.compare(password, hash);
    return isMatch;
  }catch(error){
    console.error('Error checking password:', error);
    throw error;
  }
}
