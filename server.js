var express = require('express');
var path = require('path');


var registerDestinationRoutes = require('./destinations_routes');

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

registerDestinationRoutes(app);

app.get('/form', function (req, res) {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" type="text/css" href="/stylesheet.css">
  <title>Book Flight</title>
</head>
<body>
  <nav>
    <a href="destinations.html">Manage Destinations</a>
    <a href="destinations_view.html">Browse Destinations</a>
    <a href="/form">Book Flight</a>
    <a href="users.html">Users</a>
  </nav>
  <div class="square">
    <div class="box">
      <h1>Welcome to our booking system</h1>
      <form action="/flight" method="get">
        First Name <input type="text" name="fname" placeholder="First name">
        last Name <input type="text" name="lname" placeholder="Last name"><br><br>
        <label for="date">Travel date</label><br>
        <input type="text" name="date" placeholder="mm/dd/yyyy"><br><br>
        <label for="origin">Departure</label><br>
        <input type="text" name="origin" placeholder="origin"><br><br>
        <label for="Destination">Destination</label><br>
        <input type="text" name="Destination" placeholder="Destination"><br><br>
        <input type="submit" value="Search flights">
      </form>
    </div>
  </div>
</body>
</html>`);
});

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
  <link rel="stylesheet" type="text/css" href="/stylesheet.css">
  <style>
    
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
        div.className="flight-card"
        
        div.innerText ="flight number #" + encodeURIComponent(flightNumber) + "\\n" +
                       "Departure: " + Departure + "\\n" +
                       "Destination: " + Destination + "\\n" +
                       " Price: " + encodeURIComponent(pricealtered) + "\\n";
        div.appendChild(button);
        document.getElementById("flight-box").appendChild(div);
      }
    }

    function start(){
      createdivs(destForm, originForm);
    }
  </script>
</head>

<body id="flightBody" onload="start()">
  <nav>
    <a href="destinations.html">Manage Destinations</a>
    <a href="destinations_view.html">Browse Destinations</a>
    <a href="/form">Book Flight</a>
    <a href="users.html">Users</a>
  </nav>
  <div id="flight-box">
    <h1>Available flights</h1>
  </div>
</body>
</html>`);
});


app.get('/accept', function (req, res) {
  var q = req.query;
  var {MongoClient}=require('mongodb')
    var client=new MongoClient('mongodb://127.0.0.1:27017')

    function mongoInsertPromise(obj){
    return client.connect()
    .then(function(){
        var db = client.db('buyingDB');
        var coll = db.collection('newCollection');
        return coll.insertOne(obj)
        .then(function(){
            console.log('inserted one');
        });
    })
    .catch(function(err){
        console.log(err);
    })
    .finally(function(){
        client.close();
    });
}

    var personname=q.fname+" "+q.lname
    var Flight=q.flightNumber.split('#')
    var pricecorrected=q.price.split(': ')
    var mongoObj={'name':personname,'flightNumber':Flight[1],'Departure':q.origin,'Destination':q.Destination,'price':pricecorrected[1]}
    mongoInsertPromise(mongoObj)
 
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
    <a href="users.html">Users</a>
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



app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'destinations.html'));
});


var PORT = 8080;
app.listen(PORT, function() {
  console.log("Server running at http://localhost:" + PORT);
});