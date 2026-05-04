const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Foodians is connected!");
});

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i9wlk8b.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // FoodiansDB
    const foodiansDB = client.db("FoodiansDB");
    const reviewsCollection = foodiansDB.collection("reviews");
    const favoritesCollection = foodiansDB.collection("favorites");

    // Featured Reviews
    app.get("/featured-reviews", async (req, res) => {
      const cursor = reviewsCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find().sort({createdAt : -1});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const newReview = {
        ...review,
        rating: Number(review.rating),
        createdAt: new Date()
      }
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    });

    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const updatedReview = req.body;
      const updateData = {
          $set: updatedReview
      }
      const options = {};
      const result = await reviewsCollection.updateOne(query, updateData, options);
      res.send(result);
    });

    app.delete("/reviews/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await reviewsCollection.deleteOne(query);
        res.send(result);
    })

    // My Reviews
    app.get("/my-reviews", async(req, res) => {
        const email = req.query.email;
        const cursor = reviewsCollection.find({user_email: email}).sort({createdAt: -1});
        const result = await cursor.toArray();
        res.send(result);
    })

    // My Favorites
    app.get("/favorites", async(req, res) => {
        const email = req.query.email;
        if(!email) {
            return res.status(400).send({message: "Email is required."})
        }
        const cursor = favoritesCollection.find({user_email: email}).sort({createdAt: -1});
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post("/favorites", async(req, res) => {
        const newFavorite = req.body;

        const existedOne = await favoritesCollection.findOne({
            reviewId : newFavorite.reviewId,
            user_email: newFavorite.user_email
        })

        // avoid duplicate
        if(existedOne) {
            return res.send({message: "Already added to the Favorites!"})
        }
        const result = await favoritesCollection.insertOne({...newFavorite, createdAt: new Date()})
        res.send(result);
    })

    app.delete("/favorites/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await favoritesCollection.deleteOne(query);
        res.send(result);
    })

    // Search by Regex
    app.get("/search", async(req, res) => {
        const searchByName = req.query.search;
        const result = await reviewsCollection.find({food_name: {$regex: searchByName, $options: "i"}}).toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Foodians server is running on port: ${port}`);
});
