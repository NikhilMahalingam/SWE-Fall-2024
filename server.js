var express = require('express');
var route = express();
var sql = require("mysql2");

function initiateDBConnection() {
    //Create SQL connection logic
    var connection = sql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "PCComposer"
    });
    return connection;
}

function addUser(request, response) {
    let resMsg = {};
    var dBCon = initiateDBConnection();
    var body='';
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
  var filter;
  // detect any filter on the URL line, or just retrieve the full collection
  
  try{
      var dBCon = initiateDBConnection();
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
              // Step 1 : Convert databse result set into JSON String Step 2: Parse to actual JSON Step 3: finally convert JSON into JSON String
              var result_response = JSON.stringify(JSON.parse(JSON.stringify(result)));
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
  var dBCon = initiateDBConnection();
  var body='';
  request.on('data', function(data){
    body+=data;
  });

  request.on('end', function () {
      try{
        dBCon.connect(function (err) {
          newPart = JSON.parse(body);
          sqlStatement = "INSERT INTO Computer_Part(part_name, brand, size, date_posted, unit_price) VALUES ('" + newPart.partName + "','"+ 
            newPart.brand + "'," + newPart.size + ",'" + newPart.dateTime + "'," + newPart.unitPrice + ")";
          console.log(sqlStatement);
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

route.post('/register', function(req, res){
  addUser(req, res);
});

route.post('/part', function(req, res){
  addPart(req, res);
});

route.get('/part', function(req, res) {
  listParts(req, res);
});


route.listen(8000);