import express from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";

const app = express();
const port = 3000;

// Get the directory name
const __dirname = path.resolve();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(
    "mongodb+srv://rajurao1107:raoraju1337@cluster0.zjucb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Schema
const taskSchema = new mongoose.Schema({
  title: String,
});
const Task = mongoose.model("tasks", taskSchema);

// Routes
app.post("/add-task", async (req, res) => {
  try {
    const { title } = req.body;
    const addTask = new Task({ title });
    await addTask.save();
    res.json({ message: "Task added", tasks: addTask });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Error adding task" });
  }
});

app.get("/get-tasks", async (req, res) => {
  try {
    const getTasks = await Task.find();
    res.json(getTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);
    res
      .status(200)
      .json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update-task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve Frontend (React app)
if (true) {
  app.use(express.static(path.join(__dirname, "client", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
