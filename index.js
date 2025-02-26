require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  },
});

async function run() {
  try {
    const db = client.db("task_management");
    const taskCollections = db.collection("tasks");
    const userCollections = db.collection('users')

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      task.createdAt = new Date();
      const result = await taskCollections.insertOne(task);
      res.send(result);
    });

    app.get("/task", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await taskCollections.find(query).toArray();
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.deleteOne(query);
      res.send(result);
    });

    app.get("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.findOne(query);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const task = req.body;
      const updateTask = {
        $set: task,
      };
      options = { upsert: true };
      const result = await taskCollections.updateOne(
        filter,
        updateTask,
        options
      );
      res.send(result);
    });

    app.patch("/task/:id", async (req, res) => {
      const id = req.params.id;
      const { category } = req.body;
    
      try {
        const filter = { _id: new ObjectId(id) };
        const updateTask = { $set: { category } };
        const result = await taskCollections.updateOne(filter, updateTask);
    
        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: "Task not found or no change detected" });
        }
    
        res.json({ message: "Category updated successfully", result });
      } catch (error) {
        res.status(500).json({ message: "Server error", error });
      }
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isExist = await userCollections.findOne(query);
      if (isExist) {
        return res.send({ message: "User already exsist", insertedId: null });
      }
      const result = await userCollections.insertOne(user);
      res.send(result);
    });

    app.patch("/task/reorder", async (req, res) => {
      const { tasks } = req.body;
    
      try {
        const updatePromises = tasks.map((task, index) =>
          taskCollections.updateOne(
            { _id: new ObjectId(task._id) },
            { $set: { order: index } } 
          )
        );
    
        await Promise.all(updatePromises); 
    
        res.status(200).json({ message: "Task order updated successfully!" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
      }
    });
    


  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Management server is running....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
