const express = require('express');
const route = express();
const sqlite3 = require('sqlite3').verbose();
const { generatePCBuild } = require('./apiHandlers/openaiHandler');
const stripeHandler = require('./apiHandlers/stripeHandler');
const fs = require('fs');

let db = new sqlite3.Database(process.env.Database ?? 'database.db');

function initiateDBConnection() {
    //Create SQL connection logic
    return new Promise((resolve, reject) => {
      // Initialize the database
      db = new sqlite3.Database(process.env.Database ?? 'database.db', (err) => {
        if (err) {
          return reject(err);
        }
  
        // Read the create table queries
        fs.readFile("migrations/schema.sql", 'utf8', (err, sql) => {
          if (err) {
            return reject(err);
          }
  
          // Execute the SQL
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

route.use(express.json());
route.use(express.urlencoded({extended: true}))

function addUser(request, response) {
    let resMsg = {};
    const dBCon = initiateDBConnection();
    let body='';
    request.on('data', function(data){
      body+=data;
    });

    request.on('end', function () {
        try{
          dBCon.connect(function (err) {
            newUser = JSON.parse(body);
            sqlStatement = "INSERT INTO User_Account(name, password, email) VALUES ('" + newUser.name + "','"+ newUser.password + "','" + newUser.email+"')";
            dBCon.query(sqlStatement, function (err, result) {
              if (err) {
                resMsg.message = "Service Unavailable";
                resMsg.body = "MySQL server error: CODE = "
                    + err.code + " SQL of the failed query: "
                    + err.sql + " Textual description : " + err.sqlMessage;
                response.status(503).send(resMsg);
              }
              response.set('content-type', 'application/json')
              response.status(200).send("Record inserted successfully");
              dBCon.end();
            });
          });
        }
        catch (ex) {
          response.status(500).send("Server Error");
        }
      });
    
    
    return resMsg;
}

function listParts(request, response) {
  let resMsg = {}, sqlStatement;
  let filter;
  // detect any filter on the URL line, or just retrieve the full collection
  
  try{
      const dBCon = initiateDBConnection();
      dBCon.connect(function (err) {
        if (err) throw err; // throws error in case if connection is corrupted/disconnected

        query = request.url.split('?');
        if (query[1] !== undefined) {
          // parse URL query to a collection of <key, value> pairs:
          filters = query[1].split("=");
          //filters get split on "=" as product_id(Category) = 1 (Value)
          sqlStatement = "SELECT * FROM Computer_Part WHERE " + filters[0]+"='"+filters[1]+"'";
        } else {
          sqlStatement = "SELECT * FROM Computer_Part;";
        }

        dBCon.query(sqlStatement, function (err, result) {
            if (err) {
              resMsg.message = "Service Unavailable";
              resMsg.body = "MySQL server error: CODE = "
                + err.code + " SQL of the failed query: "
                + err.sql + " Textual description : " + err.sqlMessage;
              response.status(503).send(resMsg);
            } else {
              // Step 1: Convert databse result set into JSON String 
              // Step 2: Parse to actual JSON 
              // Step 3: finally convert JSON into JSON String
              const result_response = JSON.stringify(JSON.parse(JSON.stringify(result)));
              response.set('content-type', 'application/json')
              response.status(200).send(result_response);
              dBCon.end();
            }
          });
    });
  }
  catch(err) {
    response.status(200).send(result_response);
  }
  
}

function addPart(request, response) {
  let resMsg = {};
  const dBCon = initiateDBConnection();
  let body='';
  request.on('data', function(data){
    body+=data;
  });

  request.on('end', function () {
      try{
        dBCon.connect(function (err) {
          newPart = JSON.parse(body);
          sqlStatement = "INSERT INTO Computer_Part(part_name, brand, size, date_posted, unit_price) VALUES ('" + newPart.partName + "','"+ 
            newPart.brand + "'," + newPart.size + ",'" + newPart.dateTime + "'," + newPart.unitPrice + ")";
          dBCon.query(sqlStatement, function (err, result) {
            if (err) {
              resMsg.message = "Service Unavailable";
              resMsg.body = "MySQL server error: CODE = "
                  + err.code + " SQL of the failed query: "
                  + err.sql + " Textual description : " + err.sqlMessage;
              response.status(503).send(resMsg);
            }
            response.set('content-type', 'application/json')
            response.status(200).send("Record inserted successfully");
            dBCon.end();
          });
        });
      }
      catch (ex) {
        response.status(500).send("Server Error");
      }
    });
  
  
  return resMsg;
}

function getUser(req, res) {
  const url = new URL(req.url, 'http://${req.headers.host}');
  const urlParam = url.searchParams.get('user_id');
  const id = parseInt(urlParam, 10);
  if (urlParam !== null && (id === undefined || isNaN(id))) {
    // id is invalid
    return res.status(400).json({"error": "Invalid 'id' parameter. Must be a number."});
  }
  let query = 'SELECT * FROM User_Account';
  if (urlParam !== null) {
    // Filter on the id
    query += ` WHERE user_id = ${id}`;
  }
  db.all(query, [], (err, rows) => {
    if (err) {
      // Error with server
      return res.status(500).json({"error": "Internal Server Error."});
    }
    if (rows.length === 0) {
      // User is not found
      return res.status(404).json({"error": "User not found."});
    }
    // Return the user
    res.status(200).json(rows);
  });
}

//Update user's info
function putUser(request, response) {
  let resMsg = {};
  const dBCon = initiateDBConnection();
  let body='';
  request.on('data', function(data){
    body+=data;
  });

  request.on('end', function () {
    try{
      dBCon.connect(function (err) {
        newInfo = JSON.parse(body);
        sqlStatement = "UPDATE User_Account SET name = '" + newInfo.name + "', password = '"+ newInfo.password + "', email = '" + newInfo.email +"' WHERE user_id = " + newInfo.user_id;
        dBCon.query(sqlStatement, function (err, result) {
          if (err) {
            resMsg.message = "Service Unavailable";
            resMsg.body = "MySQL server error: CODE = "
                + err.code + " SQL of the failed query: "
                + err.sql + " Textual description : " + err.sqlMessage;
            response.status(503).send(resMsg);
          }
          response.set('content-type', 'application/json')
          response.status(200).send("Record updated successfully");
          dBCon.end();
        });
      });
    }
    catch (ex) {
      response.status(500).send("Server Error");
    }
  })
}

//Delete user from user's end
function deleteUser(request, response) {
  let resMsg = {};
  const dBCon = initiateDBConnection();
  let body='';
  request.on('data', function(data){
    body+=data;
  });

  request.on('end', function () {
    try{
      dBCon.connect(function (err) {
        info = JSON.parse(body);
        sqlStatement = "DELETE FROM User_Account WHERE id = " + info.user_id;
        dBCon.query(sqlStatement, function (err, result) {
          if (err) {
            resMsg.message = "Service Unavailable";
            resMsg.body = "MySQL server error: CODE = "
                + err.code + " SQL of the failed query: "
                + err.sql + " Textual description : " + err.sqlMessage;
            response.status(503).send(resMsg);
          }
          response.set('content-type', 'application/json')
          response.status(200).send("Record deleted successfully");
          dBCon.end();
        });
      });
    }
    catch (ex) {
      response.status(500).send("Server Error");
    }
  })
  
}

//user login
function postLogin(request, response) {
  let resMsg = {};
  const dBCon = initiateDBConnection();
  let body='';
  request.on('data', function(data){
    body+=data;
  });

  request.on('end', function () {
    try{
      dBCon.connect(function (err) {
        info = JSON.parse(body);

        if(!info.username || !info.password) {
          resMsg.message = "Incorrect username or password."; 
          return response.status(400).send(resMsg);
        }
        sqlStatement = "SELECT * FROM User_Account WHERE username = ?";
        dBCon.query(sqlStatement, [info.username], function (err, result) {
          if (err) {
            resMsg.message = "Service Unavailable";
            resMsg.body = "MySQL server error: CODE = "
                + err.code + " SQL of the failed query: "
                + err.sql + " Textual description : " + err.sqlMessage;
            response.status(503).send(resMsg);
          }

          //User is not found
          if(result.length === 0)
          {
            resMsg.message = "Incorrect username or password.";
            return res.status(401).send(resMsg); 
          }

          //If user is found
          const user = result[0]; 
          if(info.password === user.password) {
            res.status(200).send("Logging in successfully"); 
          }
          else {
            resMsg.message = "Incorrect username or password.";
            return res.status(401).send(resMsg); 
          }
          response.set('content-type', 'application/json')
          response.status(200).send("Record deleted successfully");
          dBCon.end();
        });
      });
    }
    catch (ex) {
      response.status(500).send("Server Error");
    }
  })
  
}


//Generate Builds
route.post('/generate-pc-build', async function (req, res) {
  try {
    let inputDescription = '';
    req.on('data', function (data) {
      inputDescription += data;
    });

    req.on('end', async function () {
      const buildDescription = JSON.parse(inputDescription).description;
      const pcBuild = await generatePCBuild(buildDescription);

      res.set('content-type', 'application/json');
      res.status(200).send({ pcBuild });
    });
  } catch (error) {
    res.status(500).send({ message: 'Error generating PC build', error: error.toString() });
  }
});

//Handle payments
route.use('/create-payment-intent', express.json());
route.post('/create-payment-intent', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    if (!amount || amount <= 0) {
      return res.status(400).send('Invalid amount');
    }

    const paymentIntent = await stripeHandler.createPaymentIntent(amount);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User endpoints
route.post('/register', function(req, res){
  addUser(req, res);
});

route.get('/users', function(req, res){
  getUser(req, res);
})

route.put('/users', function(req, res) {
  putUser(req, res);
});

route.delete('/users', function(req, res) {
  deleteUser(req, res);
});

route.post('/login', function(req, res) {
  postLogin(req, res);
});


route.post('/part', function(req, res){
  addPart(req, res);
});

route.get('/part', function(req, res) {
  listParts(req, res);
});

port = 8000;

// initiateDBConnection();
route.listen((port), () => {
  console.log(`Server is listening on port ${port}.`);
});