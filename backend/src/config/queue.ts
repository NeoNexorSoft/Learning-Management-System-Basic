// later we can add more options like separate queues for different types of emails (welcome email, password reset email, etc), and we can also add a retry mechanism for failed jobs

const QueueConfig = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000
  }
}

export default QueueConfig;