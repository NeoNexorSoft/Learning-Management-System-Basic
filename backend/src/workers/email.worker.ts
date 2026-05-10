import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { sendEmail } from "../utils/sendEmail";

const worker = new Worker(
  "email",
  async job => {
    console.log("Processing email job:", job.id);

    const { to, subject, html } = job.data;

    await sendEmail({
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  },
  {
    connection: redisConnection,
  }
);

worker.on("completed", job => {
  console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("Job failed:", err);
});