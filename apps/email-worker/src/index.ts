import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Create worker
const worker = new Worker('email-worker-queue', async (job) => {
  console.log(`Processing job ${job.id} with data:`, job.data);
  
  // Add your job processing logic here
  switch (job.name) {
    case 'example-task':
      await processExampleTask(job.data);
      break;
    default:
      console.log(`Unknown job type: ${job.name}`);
  }
}, {
  connection: redis,
});

async function processExampleTask(data: any) {
  console.log('Processing example task:', data);
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Example task completed');
}

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log(`🚀 email-worker worker started`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await redis.quit();
  process.exit(0);
});
