require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6avkk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const db = client.db("task_management");
    const taskCollections = db.collection("tasks");

    app.post('/task', async (req, res)=>{
        const task = req.body;
        const result = await taskCollections.insertOne(task)
        res.send(result)
    })


  } finally {
    
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("Task Management server is running....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));