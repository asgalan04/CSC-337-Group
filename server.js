var express = require('express');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var { MongoClient } = require('mongodb');

var client = new MongoClient('mongodb://127.0.0.1:27017/');
var registerDestinationRoutes = require('./destinations_routes');
var app = express();

async function addUsers(username, password) {
    return await insertPromise('userDB', { username, password });
}

async function insertPromise(collName, obj) {
    try {
        await client.connect(); 
        const db = client.db('userDB');
        const coll = db.collection(collName);
        const result = await coll.insertOne(obj);
        return result;          
    } finally {
        await client.close();  
    }
}

async function loadUsers() {
    return await findPromise('userDB', {});
}

async function findPromise(collName, search) {
    try {
        await client.connect();
        const db = client.db('userDB');
        const coll = db.collection(collName);
        const arr = await coll.find(search).toArray();
        return arr;
    } finally {
        await client.close();
    }
}

async function checkLogin(username, password){
    const users = await loadUsers();
    for (const user of users) {
        if (user.username === username && user.password === password) {
            return true;
        }
    }
    return false;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

registerDestinationRoutes(app);

app.get('/form', function (req, res) {
      res.sendFile(path.join(__dirname, 'form.html'))
});

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'home.html'))
})

app.get('/handleUsers.js', function(req, res){
    res.sendFile(path.join(__dirname, 'handleUsers.js'))
})

app.get('/home', function(req, res){
    res.sendFile(path.join(__dirname, 'home.html'))
})

app.post('/home', express.urlencoded(), function(req, res){
    res.sendFile(path.join(__dirname, 'home.html'))
})

app.get('/create_user', function(req, res){
    res.sendFile(path.join(__dirname, 'create_user.html'))
})

app.post('/create_action', express.urlencoded(), async function(req, res) {
    try {
        const query = req.body;
        const hash = crypto.createHash('sha256');
        const hashedPassword = hash.update(query.password).digest('hex');

        await addUsers(query.username, hashedPassword);
        res.sendFile(path.join(__dirname, 'create_action.html'));
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating user");
    }
});

app.get('/login', function(req, res){
    res.sendFile(path.join(__dirname, 'login.html'))
})

app.post('/login', express.urlencoded(), function(req, res){
    res.sendFile(path.join(__dirname, 'login.html'))
})

app.post('/lgn_action', express.urlencoded(), async function(req, res){
    var query = req.body;
    var hash = crypto.createHash('sha256');
    var hashedPassword = hash.update(query.password).digest('hex');

    if(await checkLogin(query.username, hashedPassword)){
        res.sendFile(path.join(__dirname, 'lgn_action.html'));
    } else {
        res.sendFile(path.join(__dirname, 'lgn_action_failure.html'));
    }
});

app.post('/logout', express.urlencoded(), function(req, res){
    res.sendFile(path.join(__dirname, 'logout.html'))
})

app.get('/flight', function (req, res) {
  var fname = req.query.fname || '';
  var lname = req.query.lname || '';
  var dateTravel = req.query.date || '';
  var origin = req.query.origin || '';
  var destination = req.query.Destination || '';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <title>Available Flights</title>
  <style>
    body {
      background-color: aqua;
    }
    #box{
      margin: auto;
      background-color: snow;
      width: 50%;
      text-align: center;
      padding: 20px;
    }
  </style>
  <script>
    var fname = "${fname}";
    var lname = "${lname}";
    var dateTravel = "${dateTravel}";
    var originForm = "${origin}";
    var destForm = "${destination}";

    function getValue(id){
      var text = document.getElementById(id).innerText;
      var info = text.split('\\n');
      var flightNumber = info[0];
      var price = info[3];

      var url = "/accept?fname=" + fname +
                "&lname=" + lname +
                "&date=" + dateTravel +
                "&origin=" + originForm +
                "&Destination=" + destForm +
                "&flightNumber=" + encodeURIComponent(flightNumber) +
                "&price=" + price;

      window.location.href = url;
    }

    function createdivs(Destination, Departure){
      var value = 5;
      var price = 300;
      for (var i = 0; i < value; i++) {
        var flightNumber = Math.floor(Math.random() * 10000);
        var pricealtered = Math.floor(Math.random() * 100) + price;
        var div = document.createElement("div");
        var button = document.createElement('input');
        button.setAttribute('type','button');
        button.setAttribute('value','select');
        button.setAttribute('onclick','getValue(' + i + ')');
        div.id = i;
        div.style.backgroundColor = "white";
        div.style.margin = "10px";
        div.style.padding = "10px";
        div.style.borderRadius = "10px";
        div.style.width = "95%";
        div.style.border = "2px solid black";
        div.innerText ="flight number #" + encodeURIComponent(flightNumber) + "\\n" +
                       "Departure: " + Departure + "\\n" +
                       "Destination: " + Destination + "\\n" +
                       " Price: " + encodeURIComponent(pricealtered) + "\\n";
        div.appendChild(button);
        document.getElementById("box").appendChild(div);
      }
    }

    function start(){
      createdivs(destForm, originForm);
    }
  </script>
</head>

<body onload="start()">
  <nav>
    <a href="destinations.html">Manage Destinations</a>
    <a href="destinations_view.html">Browse Destinations</a>
    <a href="/form">Book Flight</a>
    <a href="home.html">Home</a>
  </nav>
  <div id="box">
    <h1>Available flights</h1>
  </div>
</body>
</html>`);
});


app.get('/accept', function (req, res) {
  var q = req.query;
  var data = "Passenger name: " + q.fname + " " + q.lname + " " +
             q.flightNumber + " Departure: " + q.origin +
             " Destination: " + q.Destination + " " + q.price + "\\n";

  fs.appendFile('data.txt', data, function(err){
    if (err) {
      console.log("Error writing to data.txt", err);
    }
  });

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <title>Booking Confirmed</title>
</head>
<body>

  <nav>
    <a href="destinations.html">Manage Destinations</a>
    <a href="destinations_view.html">Browse Destinations</a>
    <a href="/form">Book Flight</a>
    <a href="home.html">Users</a>
  </nav>

  <div>
    <h1>The following data has been saved</h1>
    <div>Name: ${q.fname} ${q.lname}</div>
    <div>Date: ${q.date}</div>
    <div>From: ${q.origin}</div>
    <div>To: ${q.Destination}</div>
    <div>${q.price}</div>
    <div>${q.flightNumber}</div>
    <br>
    <a href="/form" style="color:black;">Book another flight</a>
  </div>
</body>
</html>`);
});



app.get('/destinations', function(req, res) {
  res.sendFile(path.join(__dirname, 'destinations.html'));
});


var PORT = 8080;
app.listen(PORT, function() {
  console.log("Server running at http://localhost:" + PORT);
});
