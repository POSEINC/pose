import { json } from 'micro';
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: false,
  },
};

// In-memory storage for job status (replace with a database in production)
const jobStatus = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { jobId } = req.query;
    console.log(`Checking status for job ${jobId}`);
    const status = jobStatus.get(jobId);
    if (status) {
      console.log(`Status for job ${jobId}:`, status);
      res.status(200).json(status);
    } else {
      console.log(`Job ${jobId} not found`);
      res.status(404).json({ message: 'Job not found' });
    }
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = await json(req, { limit: '10mb' });
    const { garmImg, humanImg, garmentDes } = body;

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    const jobId = Date.now().toString();
    jobStatus.set(jobId, { status: 'processing' });

    // Start processing asynchronously
    processImage(jobId, garmImg, humanImg, garmentDes);

    res.status(202).json({ status: 'processing', jobId });
  } catch (error) {
    console.error('Error starting try-on request:', error);
    res.status(500).json({ message: 'Error starting try-on request', error: error.message });
  }
}

async function processImage(jobId, garmImg, humanImg, garmentDes) {
  try {
    console.log(`Starting processing for job ${jobId}`);
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const input = {
      garm_img: garmImg,
      human_img: humanImg,
      garment_des: garmentDes,
      category: "upper_body",
    };

    console.log('Input data:', JSON.stringify(input));

    const output = await replicate.run(
      "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      { input }
    );

    console.log(`Processing completed for job ${jobId}. Output:`, output);
    jobStatus.set(jobId, { status: 'completed', output });
  } catch (error) {
    console.error(`Error processing image for job ${jobId}:`, error);
    jobStatus.set(jobId, { status: 'failed', error: error.message });
  }
}
