const { Worker } = require("bullmq");
const queueConnection = require("../config/queueConnection");

// Background job processor
const worker = new Worker(
  "task-events",

  async (job) => {
    console.log("--------------------------------");
    console.log("Processing background job...");
    console.log("Job ID:", job.id);
    console.log("Job Name:", job.name);

    const { taskId, title } = job.data;

    console.log("Task ID:", taskId);
    console.log("Task Title:", title);

    // Simulate background notification processing
    console.log(`Preparing notification for: ${title}`);

    console.log("Background job completed!");
    console.log("--------------------------------");

    return {
      success: true,
      taskId,
      processedAt: new Date().toISOString(),
    };
  },

  {
    connection: queueConnection,
    concurrency: 5,
  },
);

// Job events
worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed successfully`, result);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("Worker error:", error.message);
});

console.log("TaskFlow background worker started!");

// Graceful shutdown
const shutdown = async () => {
  console.log("Closing worker...");

  await worker.close();

  console.log("Worker closed successfully!");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
