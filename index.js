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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhkkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    const db = client.db("brianCaceres-Rci-DB");

    // Access collections correctly
    const allResortDataCollection = db.collection("allResorts");
    const usersCollection = db.collection("users");
    const allBookingsCollection = db.collection("allBookings");
    const paymentInfoCollection = db.collection("paymentInfo");

    // Posting Users data to MongoDB database
    app.post("/users", async (req, res) => {
      try {
        const { name, email } = req.body;

        if (!name || !email) {
          return res.status(400).send("Name and email are required");
        }

        // Check if user with the same email already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(409).send("User with this email already exists");
        }

        console.log(req.body); // Logs posted user data for debugging (optional)
        const result = await usersCollection.insertOne(req.body);

        res.status(201).send({
          message: "User successfully added",
          userId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding user data:", error.message);
        res.status(500).send("Internal Server Error");
      }
    });

    // GET endpoint to fetch user data by email
    app.get("/users", async (req, res) => {
      const { email } = req.query;

      try {
        const user = await usersCollection.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Get all user data without pagination
    app.get("/all-users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching all user data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Update user role to admin
    app.patch("/update-user", async (req, res) => {
      const { email, isAdmin } = req.body;

      try {
        // Ensure that email and isAdmin are provided
        if (!email || typeof isAdmin !== "boolean") {
          console.error(
            "Validation failed: Email or isAdmin status is missing"
          );
          return res.status(400).send("Email and isAdmin status are required");
        }

        // Debugging: Log the email and isAdmin
        console.log(`Updating user: ${email}, isAdmin: ${isAdmin}`);

        // Update user role
        const result = await usersCollection.updateOne(
          { email: email },
          { $set: { isAdmin: isAdmin } }
        );

        // Debugging: Log the result of the update operation
        console.log(`Update result: ${JSON.stringify(result)}`);

        if (result.modifiedCount === 0) {
          console.error("User not found or role not updated");
          return res.status(404).send("User not found or role not updated");
        }

        res.send({ success: true, message: "User role updated successfully" });
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Update or add user info (any incoming data)
    app.patch("/update-user-info", async (req, res) => {
      const { email, age, securityDeposit, idNumber } = req.body;

      try {
        const result = await usersCollection.updateOne(
          { email: email },
          { $set: { age, securityDeposit, idNumber } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found or information not updated.",
          });
        }

        res.json({
          success: true,
          message: "User information updated successfully.",
        });
      } catch (error) {
        console.error("Error updating user info:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    // Get paginated and filtered resorts data from MongoDB Database
    app.get("/resorts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Find the resorts without any total limit
    const resorts = await allResortDataCollection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get the total count of resorts
    const count = await allResortDataCollection.countDocuments();

    res.send({
      resorts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalResorts: count, // Include the total count of resorts
    });
  } catch (error) {
    console.error("Error fetching resort data:", error);
    res.status(500).send("Internal Server Error");
  }
});


    // Get all resort data without pagination
    app.get("/all-resorts", async (req, res) => {
      try {
        const resorts = await allResortDataCollection.find().toArray();
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

    //Bookings

    // Posting Bookings data to MongoDB database
    app.post("/bookings", async (req, res) => {
      try {
        const resort = req.body;
        console.log(resort); // Logs posted resort data for debugging (optional)
        const result = await allBookingsCollection.insertOne(resort);
        res.send(result);
      } catch (error) {
        console.error("Error adding resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    //Payment Info code will be here

    // GET endpoint to fetch user data by email
    app.get("/bookings", async (req, res) => {
      const { email } = req.query;

      try {
        const user = await allBookingsCollection.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Get all booking data without pagination
    app.get("/all-bookings", async (req, res) => {
      try {
        const bookings = await allBookingsCollection.find().toArray();
        res.send(bookings);
      } catch (error) {
        console.error("Error fetching all booking data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Set up your routes here

    // Start the server after successful connection
    app.listen(port, () => {
      console.log(`Airbnb server is running on Port ${port}`);
    });
  } catch (error) {
    console.error("Error running the server:", error);
  }
}

// Route for health check
app.get("/", (req, res) => {
  res.send("Brian Caceres RCI server is running");
});

run().catch(console.dir);