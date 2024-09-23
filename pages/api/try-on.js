import { json } from 'micro';
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = await json(req, { limit: '10mb' }); // Increase the limit to 10mb
    const { garmImg, humanImg, garmentDes } = body;

    // Log the token to ensure it is being read correctly (remove this in production)
    console.log('REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN);

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const input = {
      garm_img: garmImg,
      human_img: humanImg,
      garment_des: garmentDes,
      category: "upper_body", // You might want to make this dynamic based on the product
    };

    const output = await replicate.run(
      "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      { input }
    );

    res.status(200).json({ output });
  } catch (error) {
    console.error('Error calling Replicate API:', error);
    res.status(500).json({ message: 'Error processing try-on request', error: error.message });
  }
}
