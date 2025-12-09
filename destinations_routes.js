var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://127.0.0.1:27017';
var dbName = 'flightDB';          
var DEST_COLLECTION = 'destinations';

var DEFAULT_DESTINATIONS = [
  { code: "TUS", city: "Tucson",        country: "USA" },
  { code: "PHX", city: "Phoenix",       country: "USA" },
  { code: "LAX", city: "Los Angeles",   country: "USA" },
  { code: "SFO", city: "San Francisco", country: "USA" },
  { code: "SEA", city: "Seattle",       country: "USA" }
];

async function getAllDestinations() {
  var client = new MongoClient(url);

  try {
    await client.connect();
    var db = client.db(dbName);
    var coll = db.collection(DEST_COLLECTION);

    var docs = await coll.find({}).toArray();

    if (docs.length === 0) {
      await coll.insertMany(DEFAULT_DESTINATIONS);
      docs = await coll.find({}).toArray();
    }

    await client.close();
    return docs;
  } catch (err) {
    console.log('Error in getAllDestinations:', err);
    try {
      await client.close();
    } catch (e) {}
    return [];
  }
}

function registerDestinationRoutes(app) {

  app.get('/api/destinations', async function(req, res) {
    try {
      var destinations = await getAllDestinations();

      res.json({
        ok: true,
        destinations: destinations
      });
    } catch (err) {
      console.log('Error loading destinations:', err);
      res.json({
        ok: false,
        message: 'Failed to load destinations'
      });
    }
  });

  app.post('/api/destinations', async function(req, res) {
    var client = new MongoClient(url);

    try {
      await client.connect();
      var db = client.db(dbName);
      var coll = db.collection(DEST_COLLECTION);

      var code = req.body.code;
      var city = req.body.city;
      var country = req.body.country;

      if (!code || !city || !country) {
        await client.close();
        return res.json({
          ok: false,
          message: 'Missing code, city, or country'
        });
      }

      var upperCode = code.toUpperCase();

      var existing = await coll.findOne({ code: upperCode });

      if (existing) {
        await client.close();
        return res.json({
          ok: false,
          message: 'Destination code already exists'
        });
      }

      var newDest = {
        code: upperCode,
        city: city,
        country: country
      };

      await coll.insertOne(newDest);

      await client.close();

      res.json({
        ok: true,
        destination: newDest
      });

    } catch (err) {
      console.log('Error adding destination:', err);
      try {
        await client.close();
      } catch (e) {}
      res.json({
        ok: false,
        message: 'Failed to add destination'
      });
    }
  });

}

module.exports = registerDestinationRoutes;
