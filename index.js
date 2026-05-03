const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Foodians is connected!");
})

// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i9wlk8b.mongodb.net/?appName=Cluster0`;

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

    // FoodiansDB
    const foodiansDB = client.db("FoodiansDB");
    const reviewsCollection = foodiansDB.collection("reviews");

    // Reviews
    app.get("/reviews", async(req, res) => {
        const cursor = reviewsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get("/reviews/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await reviewsCollection.findOne(query);
        res.send(result);
    })

    app.post("/reviews", async (req, res) => {
        const newReview = req.body;
        const result = await reviewsCollection.insertOne(newReview);
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


app.listen(port, () => {
    console.log(`Foodians server is running on port: ${port}`);
})