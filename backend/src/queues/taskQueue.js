const { Queue } = require("bullmq");
const queueConnection = require("../config/queueConnection");

const taskQueue = new Queue("task-events", {
  connection: queueConnection,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 2000,
    },

    removeOnComplete: {
      count: 100,
    },

    removeOnFail: {
      count: 500,
    },
  },
});

module.exports = { taskQueue };
