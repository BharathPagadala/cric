const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const positions = [0, 100, 80, 70, 50, 0, 0, 0];
const dataFilePath = path.join(__dirname, 'user.js');

const uri = "mongodb+srv://bharathpagadala0:WvxUvLnzu9M7bb0B@cluster0.um4rsrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let usersCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("cricusers");
    usersCollection = db.collection("members");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}
connectDB();

app.get('/viewAll', async (req, res) => {
  try {
    if (!usersCollection) return res.status(500).json({ error: "Database not initialized" });
    const members = await usersCollection.find().toArray();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
});

app.get('/addAmount/:person/:position', async (req, res) => {
  const { person, position } = req.params;

  try {
    if (!usersCollection) return res.status(500).json({ error: "Database not initialized" });

    const member = await usersCollection.findOne({ name: person.toLowerCase() });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const updatedWinnings = member.winnings + positions[parseInt(position)];
    const updatedEarnings = updatedWinnings - usersCollection.findOne({ id: 0 }).winnings * 50;

    await usersCollection.updateOne(
      { name: person.toLowerCase() },
      { $set: { winnings: updatedWinnings, earnings: updatedEarnings } }
    );

    res.json({ success: true, message: "Updated successfully" });

  } catch (error) {
    res.status(500).json({ error: "Error updating data", details: error.message });
  }
});

app.get('/addMatch', async (req, res) => {
    try {
        if (!usersCollection) return res.status(500).json({ error: "Database not initialized" });
    
        const updateResult = await usersCollection.updateOne(
          { id: 0 }, // Find the document with id: 0
          { $inc: { winnings: 1 } } // Increment winnings by 1
        );
    
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: "Document with id: 0 not found" });
        }
    
        res.json({ message: "Winnings updated successfully", updatedCount: updateResult.modifiedCount });
      } catch (error) {
        res.status(500).json({ error: "Failed to update winnings", details: error.message });
      }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
