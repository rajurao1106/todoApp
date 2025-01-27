import express from "express"
import mongoose from "mongoose"
import path from "path";
import cors from "cors"

const app = express();
const port = 3000;
const __dirname = path.resolve();

//middleware
app.use(cors());
app.use(express.json());

//database connection
mongoose
  .connect(
    "mongodb+srv://rajurao1107:raoraju1337@cluster0.zjucb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

//schema
const taskSchema = new mongoose.Schema({
  title: String,
});
const Task = mongoose.model("tasks", taskSchema);

//routes
app.post("/add-task", async (req, res) => {
  try {
    const { title } = req.body;
    const addTask = new Task({ title });
    await addTask.save();
    res.json({ message: "Task added", tasks: addTask });
  } catch (error) {
    console.log(error);
  }
});

app.get("/get-tasks", async (req, res) => {
  try {
    const getTasks = await Task.find();
    res.json(getTasks);
  } catch (error) {
    console.log(error);
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

if (true) {
  	app.use(express.static(path.join(__dirname, "/client/dist")));
  
  	app.get("*", (req, res) => {
  		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  	});
  }

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

