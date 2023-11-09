const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors({ origin: ["http://localhost:5173", "https://gazela-fine-dine.web.app"] }))
app.use(express.json());




// from mongodb atlas
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xq1u8gq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const mainMenuCollection = client.db('gazelaFineDine').collection('mainmenu');
    const allDishesCollection = client.db('gazelaFineDine').collection('allDishes');
    const orderCollection = client.db('gazelaFineDine').collection('mealOrder');
    const userCollection = client.db('gazelaFineDine').collection('foodUsers');


    app.get('/mainmenu', async (req, res) => {
      const cursor = mainMenuCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //collect all dishes api
    app.get('/allDishes', async (req, res) => {
      const cursor = allDishesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //get single dishes by ID
    app.get('/allDishes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allDishesCollection.findOne(query);
      res.send(result);
    })

    //top selling dishes

    app.get('/getTopItem', async (req, res) => {
      const result = await allDishesCollection.find({}).toArray();
      result.sort((a, b) => b.sale - a.sale);
      const top6 = result.slice(0, 6);
      res.send(top6)

    })
    // meal count in mongodb
    app.get('/mealSale', async (req, res) => {
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) }
      const currentSale = await allDishesCollection.findOne(filter)
      const newSale = parseInt(currentSale.sale) + 1;
      const update = { $set: { sale: newSale } }
      const result = await allDishesCollection.updateOne(filter, update)

    }),


      //get data for order food
      app.post('/mealOrder', async (req, res) => {
        const mealOrder = req.body;
        console.log(mealOrder);
        const result = await orderCollection.insertOne(mealOrder);
        res.send(result);
      })

    // collect alredy ordered data
    app.get('/mealOrder', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await orderCollection.find().toArray();
      res.send(result);
    })

    //create user
    app.post('foodUsers', async (req, res) => {
      const user = req.body;
      console.log('my user', foodUsers);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('we all love to eat here everyday !')
})

app.listen(port, () => {
  console.log(`Gazela fine dine server is running on port ${port}`)
})