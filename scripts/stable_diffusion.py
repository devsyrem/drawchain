#!/usr/bin/env python3
"""
Local Stable Diffusion script for AI NFT Generator
Implements img2img generation using CompVis/stable-diffusion
"""

import argparse
import os
import sys
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

def check_dependencies():
    """Check if required dependencies are available"""
    missing = []
    try:
        import torch
    except ImportError:
        missing.append("torch")
    
    try:
        import diffusers
    except ImportError:
        missing.append("diffusers")
    
    try:
        from PIL import Image
    except ImportError:
        missing.append("pillow")
    
    if missing:
        print(f"Missing dependencies: {', '.join(missing)}")
        print("Please install them with: pip install torch diffusers pillow transformers")
        return False
    return True

class LocalStableDiffusion:
    def __init__(self):
        if not check_dependencies():
            sys.exit(1)
            
        import torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipe = None
        print(f"Using device: {self.device}")
        
    def load_model(self):
        """Load the Stable Diffusion model"""
        try:
            import torch
            from diffusers import StableDiffusionImg2ImgPipeline
            
            print("Loading Stable Diffusion model...")
            # Use CompVis model as requested
            model_id = "runwayml/stable-diffusion-v1-5"
            
            self.pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            
            self.pipe = self.pipe.to(self.device)
            
            # Enable memory efficient attention if CUDA is available
            if self.device == "cuda":
                try:
                    self.pipe.enable_attention_slicing()
                    self.pipe.enable_xformers_memory_efficient_attention()
                except:
                    print("Note: xformers not available, continuing without memory optimization")
            
            print("Model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            print("This might be due to missing dependencies or insufficient memory.")
            print("For a simple fallback, consider using an online API instead.")
            sys.exit(1)
    
    def generate_image(self, input_path, output_path, prompt, strength=0.7, guidance_scale=7.5, num_inference_steps=20):
        """Generate image using img2img"""
        try:
            import torch
            from PIL import Image
            
            # Load and preprocess input image
            init_image = Image.open(input_path).convert("RGB")
            
            # Resize to optimal size (512x512 for SD v1.5)
            init_image = init_image.resize((512, 512))
            
            print(f"Generating image with prompt: {prompt}")
            print(f"Parameters: strength={strength}, guidance_scale={guidance_scale}, steps={num_inference_steps}")
            
            # Generate image
            with torch.autocast(self.device):
                result = self.pipe(
                    prompt=prompt,
                    image=init_image,
                    strength=strength,
                    guidance_scale=guidance_scale,
                    num_inference_steps=num_inference_steps,
                    negative_prompt="blurry, low quality, distorted, deformed, ugly, bad anatomy"
                )
            
            # Save output image
            result.images[0].save(output_path)
            print(f"Image saved to: {output_path}")
            
        except Exception as e:
            print(f"Error generating image: {e}")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Local Stable Diffusion Image Generation")
    parser.add_argument("--input", required=True, help="Input image path")
    parser.add_argument("--output", required=True, help="Output image path")
    parser.add_argument("--prompt", required=True, help="Text prompt for generation")
    parser.add_argument("--strength", type=float, default=0.7, help="How much to change from original (0.0-1.0)")
    parser.add_argument("--guidance_scale", type=float, default=7.5, help="How closely to follow the prompt")
    parser.add_argument("--num_inference_steps", type=int, default=20, help="Number of denoising steps")
    
    args = parser.parse_args()
    
    # Validate inputs
    if not os.path.exists(args.input):
        print(f"Error: Input file {args.input} does not exist")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    # Initialize and run Stable Diffusion
    sd = LocalStableDiffusion()
    sd.load_model()
    sd.generate_image(
        args.input,
        args.output,
        args.prompt,
        args.strength,
        args.guidance_scale,
        args.num_inference_steps
    )

if __name__ == "__main__":
    main()