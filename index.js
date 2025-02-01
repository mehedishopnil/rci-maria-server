const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://rci-maria:${process.env.DB_PASS}@cluster0.q6abx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server
    await client.connect();

    // Access the target database:
    const db = client.db("rci-db");

    // Access collections correctly
    const allResortDataCollection = db.collection("allResorts");

    // Get all resort data with a limit of 30 resorts
    app.get("/allResorts", async (req, res) => {
      try {
        // Fetch resorts with a limit of 30
        const resorts = await allResortDataCollection.find().limit(30).toArray();
        res.send(resorts);
      } catch (error) {
        console.error("Error fetching all resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Posting resort data to MongoDB database
    app.post("/resorts", async (req, res) => {
      try {
        const resort = req.body;
        console.log(resort); // Logs posted resort data for debugging (optional)
        const result = await allResortDataCollection.insertOne(resort);
        res.send(result);
      } catch (error) {
        console.error("Error adding resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Start the server after successful connection
    app.listen(port, () => {
      console.log(`RCI Server is running on Port ${port}`);
    });
  } catch (error) {
    console.error("Error running the server:", error);
  }
}

// Route for health check
app.get("/", (req, res) => {
  res.send("Maria RCI server is running");
});

run().catch(console.dir);