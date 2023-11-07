const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use('/', cors());
app.use(express.json());


console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)

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
    await client.connect();

    const mainMenuCollection = client.db('gazelaFineDine').collection('mainmenu');
    const allDishesCollection = client.db('gazelaFineDine').collection('allDishes');


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

    //collect dishes by category name
    app.get('/allDishes/:(_id)', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(_id) }

      const options = {
        projection: { title: 1, foodName: 1, price: 1, foodCategory: 1, image: 1 },
      };

      const result = await allDishesCollection.findOne(query, options);
      res.send(result);
    })



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