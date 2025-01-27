import React, { useEffect, useState } from "react";

export default function App() {
  // State variables
  const [getTasks, setGetTasks] = useState([]); // Stores tasks
  const [taskInput, setTaskInput] = useState(""); // Input for task title
  const [editTask, setEditTask] = useState({ id: null, title: "" }); // For editing a task
  const [isLoading, setIsLoading] = useState(false); // Loading state for fetching or submitting tasks
  const [error, setError] = useState(""); // Error state for handling errors

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3000/get-tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setGetTasks(data); // Update tasks state with fetched data
    } catch (err) {
      setError(err.message); // Set error message if something goes wrong
    } finally {
      setIsLoading(false); // Stop loading after request is complete
    }
  };

  // Handle task submission (add or update)
  const handleSubmit = async () => {
    if (!taskInput) {
      setError("Please enter a task title.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      if (editTask.id) {
        // If editing an existing task
        await updateTask();
      } else {
        // Add new task
        await addTask();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading after submission
    }
  };

  // Add new task
  const addTask = async () => {
    const response = await fetch("http://localhost:3000/add-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: taskInput }),
    });

    if (response.ok) {
      await fetchTasks(); // Re-fetch tasks after adding
      setTaskInput(""); // Clear input field
    } else {
      throw new Error("Failed to add task");
    }
  };

  // Update an existing task
  const updateTask = async () => {
    const response = await fetch(`http://localhost:3000/update-task/${editTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: taskInput }),
    });

    if (response.ok) {
      const updatedTask = await response.json();
      setGetTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      setEditTask({ id: null, title: "" }); // Reset edit state
      setTaskInput(""); // Clear input field
    } else {
      throw new Error("Failed to update task");
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setGetTasks(getTasks.filter((task) => task._id !== id)); // Remove the task from the list
    } else {
      setError("Failed to delete task");
    }
  };

  // Handle editing a task (pre-fill input for editing)
  const handleEdit = (task) => {
    setEditTask({ id: task._id, title: task.title });
    setTaskInput(task.title); // Pre-fill input with task title
  };

  return (
    <div className="w-1/2 mx-auto mt-20 flex flex-col items-center">
      {/* Error Message */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Task Input */}
      <input
        className="border p-2 mb-4 w-full max-w-md"
        type="text"
        placeholder="Enter task title..."
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
      />
      
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 w-full max-w-md mb-4"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : editTask.id ? "Update Task" : "Add Task"}
      </button>

      {/* Loading Spinner */}
      {isLoading && <div className="spinner">Loading...</div>}

      {/* Task List */}
      <div className="overflow-scroll h-96 w-full max-w-md">
        {getTasks.length === 0 && !isLoading ? (
          <p>No tasks found. Add some tasks!</p>
        ) : (
          [...getTasks].reverse().map((task) => (
            <div key={task._id} className="task-item p-2 mb-2 border rounded-md flex justify-between items-center">
              <h1>{task.title}</h1>
              <div>
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


