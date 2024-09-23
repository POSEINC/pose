import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { garmImg, humanImg, garmentDes } = req.body;

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const output = await replicate.run(
      "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      {
        input: {
          garm_img: garmImg,
          human_img: humanImg,
          garment_des: garmentDes,
          category: "upper_body", // You might want to make this dynamic based on the product
        }
      }
    );

    res.status(200).json({ output });
  } catch (error) {
    console.error('Error calling Replicate API:', error);
    res.status(500).json({ message: 'Error processing try-on request' });
  }
}
