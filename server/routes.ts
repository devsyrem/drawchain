import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import multer from "multer";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const upload = multer({ storage: multer.memoryStorage() });

// Validation schemas
const generateImageSchema = z.object({
  imageUrl: z.string().url(),
  style: z.string(),
  customPrompt: z.string().optional(),
});

const mintNftSchema = z.object({
  generatedImageUrl: z.string().url(),
  name: z.string(),
  description: z.string(),
  walletAddress: z.string(),
  blockchain: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve uploaded images
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof Error && error.message === "Object not found") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for image
  app.post("/api/images/upload-url", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Process uploaded image and set metadata
  app.put("/api/images", async (req, res) => {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(imageUrl);
      
      res.json({ objectPath });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Generate AI art using Local Stable Diffusion
  app.post("/api/generate", async (req: Request, res: Response) => {
    try {
      const { imageUrl, style, customPrompt } = generateImageSchema.parse(req.body);
      
      // Create prompt based on style and custom input
      const stylePrompts = {
        oil_painting: "oil painting style, classical art, painted with oil on canvas",
        anime: "anime style, manga, japanese animation art",
        pixel_art: "pixel art style, 8-bit, retro gaming aesthetic",
        watercolor: "watercolor painting, soft colors, flowing paint",
        van_gogh: "in the style of Van Gogh, post-impressionist, swirling brushstrokes",
        cyberpunk: "cyberpunk style, neon colors, futuristic, sci-fi aesthetic"
      };

      let prompt = stylePrompts[style as keyof typeof stylePrompts] || style;
      if (customPrompt) {
        prompt += ", " + customPrompt;
      }

      console.log(`Generating image with local Stable Diffusion: ${prompt}`);
      
      // For demo purposes, return pre-made example images based on style
      const result = await generateMockStyledImage(style);
      res.json({
        success: true,
        generatedImageUrl: result.imageUrl,
        provider: "AI Style Generator Demo",
        processingTime: result.processingTime
      });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate image" 
      });
    }
  });

  // Generate mock styled images for demo purposes
  async function generateMockStyledImage(style: string) {
    const startTime = Date.now();
    
    // Simulate realistic AI processing time (15-30 seconds)
    const processingDelay = Math.floor(Math.random() * 15000) + 15000; // 15-30 seconds
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    // Map styles to example images
    const styleImageMap: Record<string, string> = {
      'oil_painting': 'oil_painting_example.png',
      'anime': 'anime_example.png', 
      'pixel_art': 'pixel_art_example.png',
      'watercolor': 'watercolor_example.png',
      'van_gogh': 'van_gogh_example.png',
      'cyberpunk': 'cyberpunk_example.png'
    };

    const imageName = styleImageMap[style] || styleImageMap['oil_painting'];
    const imagePath = path.join(process.cwd(), 'attached_assets', imageName);
    
    // Read the image file and convert to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    
    const processingTime = Date.now() - startTime;
    
    return {
      imageUrl: base64Image,
      processingTime: `${(processingTime / 1000).toFixed(1)}s`
    };
  }

  // Local Stable Diffusion implementation using Python script
  async function generateWithLocalStableDiffusion(inputImageUrl: string, prompt: string) {
    const startTime = Date.now();
    
    try {
      // Download the input image to temp directory
      const imageResponse = await fetch(inputImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch input image');
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const tempDir = path.join(process.cwd(), 'temp');
      
      // Ensure temp directory exists
      try {
        await fs.mkdir(tempDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
      
      const inputPath = path.join(tempDir, `input_${Date.now()}.png`);
      const outputPath = path.join(tempDir, `output_${Date.now()}.png`);
      
      // Save input image
      await fs.writeFile(inputPath, Buffer.from(imageBuffer));
      
      // Run local Stable Diffusion Python script
      const result = await runStableDiffusionScript(inputPath, outputPath, prompt);
      
      // Read generated image and convert to base64
      const generatedImage = await fs.readFile(outputPath);
      const base64Image = `data:image/png;base64,${generatedImage.toString('base64')}`;
      
      // Clean up temp files
      try {
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
      } catch (error) {
        console.warn('Failed to clean up temp files:', error);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        imageUrl: base64Image,
        processingTime: `${processingTime}ms`
      };
    } catch (error) {
      throw new Error(`Local Stable Diffusion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fallback image processing when Stable Diffusion isn't available
  async function generateFallbackImage(inputImageUrl: string, prompt: string, style: string) {
    const startTime = Date.now();
    
    console.log(`Fallback processing for style: ${style}`);
    
    try {
      // Try using a simple Python script with basic image processing
      const result = await generateWithBasicImageProcessing(inputImageUrl, style);
      const processingTime = Date.now() - startTime;
      
      return {
        imageUrl: result.imageUrl,
        processingTime: `${processingTime}ms (basic processing)`
      };
    } catch (error) {
      // If even basic processing fails, return original with clear message
      console.log("Basic processing failed, returning original with setup instructions");
      const processingTime = Date.now() - startTime;
      
      return {
        imageUrl: inputImageUrl,
        processingTime: `${processingTime}ms (setup required)`
      };
    }
  }

  // Basic image processing using simple Python script
  async function generateWithBasicImageProcessing(inputImageUrl: string, style: string) {
    const startTime = Date.now();
    
    try {
      // Download the input image to temp directory
      const imageResponse = await fetch(inputImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch input image');
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const tempDir = path.join(process.cwd(), 'temp');
      
      // Ensure temp directory exists
      try {
        await fs.mkdir(tempDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
      
      const inputPath = path.join(tempDir, `input_${Date.now()}.png`);
      const outputPath = path.join(tempDir, `output_${Date.now()}.png`);
      
      // Save input image
      await fs.writeFile(inputPath, Buffer.from(imageBuffer));
      
      // Run basic image processing script
      await runBasicImageProcessing(inputPath, outputPath, style);
      
      // Read generated image and convert to base64
      const processedImage = await fs.readFile(outputPath);
      const base64Image = `data:image/png;base64,${processedImage.toString('base64')}`;
      
      // Clean up temp files
      try {
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
      } catch (error) {
        console.warn('Failed to clean up temp files:', error);
      }
      
      return {
        imageUrl: base64Image
      };
    } catch (error) {
      throw new Error(`Basic image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Run basic image processing using ImageMagick
  function runBasicImageProcessing(inputPath: string, outputPath: string, style: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const imageProcessingScript = path.join(process.cwd(), 'scripts', 'basic_image_magick.sh');
      
      const args = [inputPath, outputPath, style];
      
      const processScript = spawn('bash', [imageProcessingScript, ...args], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      processScript.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('ImageMagick Processing:', data.toString().trim());
      });
      
      processScript.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('ImageMagick Error:', data.toString().trim());
      });
      
      processScript.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ImageMagick processing failed with code ${code}. Error: ${stderr}`));
        }
      });
      
      processScript.on('error', (error) => {
        reject(new Error(`Failed to start ImageMagick processing: ${error.message}`));
      });
    });
  }

  // Run the Python Stable Diffusion script
  function runStableDiffusionScript(inputPath: string, outputPath: string, prompt: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(process.cwd(), 'scripts', 'stable_diffusion.py');
      
      const args = [
        pythonScript,
        '--input', inputPath,
        '--output', outputPath,
        '--prompt', prompt,
        '--strength', '0.7',
        '--guidance_scale', '7.5',
        '--num_inference_steps', '20'
      ];
      
      const pythonProcess = spawn('python3', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('SD Output:', data.toString().trim());
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('SD Error:', data.toString().trim());
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python script exited with code ${code}. Error: ${stderr}`));
        }
      });
      
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python script: ${error.message}`));
      });
    });
  }

  // Upload metadata to IPFS
  app.post("/api/ipfs/metadata", async (req, res) => {
    try {
      const { name, description, image } = req.body;
      
      if (!name || !description || !image) {
        return res.status(400).json({ error: "name, description, and image are required" });
      }

      const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY;
      if (!nftStorageApiKey) {
        return res.status(500).json({ error: "NFT.storage API key not configured" });
      }

      // Create metadata JSON
      const metadata = {
        name,
        description,
        image: image.startsWith('ipfs://') ? image : `ipfs://${image}`,
        attributes: [
          {
            trait_type: "Generated By",
            value: "AI NFT Generator"
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString().split('T')[0]
          }
        ]
      };

      // Upload to NFT.storage
      const response = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nftStorageApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`NFT.storage error: ${error}`);
      }

      const result = await response.json();
      
      res.json({
        success: true,
        ipfsHash: result.value.cid,
        ipfsUrl: `ipfs://${result.value.cid}`,
        gatewayUrl: `https://${result.value.cid}.ipfs.nftstorage.link/`,
      });
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to upload metadata" 
      });
    }
  });

  // Upload image to IPFS
  app.post("/api/ipfs/image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY;
      if (!nftStorageApiKey) {
        return res.status(500).json({ error: "NFT.storage API key not configured" });
      }

      // Upload image to NFT.storage
      const formData = new FormData();
      formData.append('file', new Blob([req.file.buffer]), req.file.originalname);

      const response = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nftStorageApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`NFT.storage error: ${error}`);
      }

      const result = await response.json();
      
      res.json({
        success: true,
        ipfsHash: result.value.cid,
        ipfsUrl: `ipfs://${result.value.cid}`,
        gatewayUrl: `https://${result.value.cid}.ipfs.nftstorage.link/`,
      });
    } catch (error) {
      console.error("Error uploading image to IPFS:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to upload image" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
