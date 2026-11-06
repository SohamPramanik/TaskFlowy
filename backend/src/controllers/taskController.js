const { getCache, setCache, deleteCache } = require("../services/cacheService");
const Task = require("../models/Task");
const { taskQueue } = require("../queues/taskQueue");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
    });

    // Invalidate old task list cache
    await deleteCache("tasks:all");

    // Add background job
    let backgroundJob = "queued";

    try {
      await taskQueue.add(
        "task-created",
        {
          taskId: task._id.toString(),
          title: task.title,
        },
        {
          jobId: `task-created-${task._id}`,
        },
      );
    } catch (error) {
      backgroundJob = "not_queued";
      console.error("Background job enqueue failed:", error.message);
    }
    await deleteCache("tasks:all");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      backgroundJob,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL TASKS

exports.getTasks = async (req, res) => {
  try {
    const cacheKey = "tasks:all";

    // 1. Check Redis
    const cachedTasks = await getCache(cacheKey);

    if (cachedTasks !== null) {
      return res.status(200).json({
        success: true,
        source: "redis",
        count: cachedTasks.length,
        data: cachedTasks,
      });
    }

    // 2. Cache miss: fetch from MongoDB
    const tasks = await Task.find().sort({ createdAt: -1 });

    // 3. Store result in Redis for 60 seconds
    await setCache(cacheKey, tasks, 60);

    // 4. Return response
    res.status(200).json({
      success: true,
      source: "mongodb",
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE TASK

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `tasks:${id}`;

    // Check Redis
    const cachedTask = await getCache(cacheKey);

    if (cachedTask !== null) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: cachedTask,
      });
    }

    // Fetch from MongoDB
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Store in Redis
    await setCache(cacheKey, task, 60);

    res.status(200).json({
      success: true,
      source: "mongodb",
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
    await deleteCache("tasks:all", `tasks:${req.params.id}`);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

    await deleteCache("tasks:all", `tasks:${req.params.id}`);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }
};
