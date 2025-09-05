#!/usr/bin/env python3
"""
Basic image processing script for AI NFT Generator
Applies style-based filters and transformations using PIL/Pillow
"""

import argparse
import os
import sys
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import colorsys

def apply_oil_painting_effect(image):
    """Apply oil painting style effects"""
    # Smooth the image and enhance colors
    image = image.filter(ImageFilter.SMOOTH_MORE)
    image = image.filter(ImageFilter.EDGE_ENHANCE)
    
    # Increase saturation and contrast
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.3)
    
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.2)
    
    return image

def apply_anime_effect(image):
    """Apply anime/manga style effects"""
    # Posterize to reduce colors (anime-like effect)
    image = ImageOps.posterize(image, 4)
    
    # Enhance contrast and saturation
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.4)
    
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.3)
    
    # Edge enhance for sharp anime lines
    image = image.filter(ImageFilter.EDGE_ENHANCE_MORE)
    
    return image

def apply_pixel_art_effect(image):
    """Apply pixel art style effects"""
    # Resize down and back up for pixelated effect
    width, height = image.size
    small_size = (width // 8, height // 8)
    
    # Resize to small size then back to original
    image = image.resize(small_size, Image.NEAREST)
    image = image.resize((width, height), Image.NEAREST)
    
    # Posterize to reduce color palette
    image = ImageOps.posterize(image, 3)
    
    return image

def apply_watercolor_effect(image):
    """Apply watercolor painting style effects"""
    # Blur for soft watercolor look
    image = image.filter(ImageFilter.GaussianBlur(radius=1))
    
    # Reduce brightness slightly
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(0.9)
    
    # Increase saturation
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.2)
    
    return image

def apply_van_gogh_effect(image):
    """Apply Van Gogh style effects"""
    # Heavy texture and color enhancement
    image = image.filter(ImageFilter.EMBOSS)
    image = image.filter(ImageFilter.EDGE_ENHANCE)
    
    # Increase color saturation dramatically
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.6)
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.4)
    
    return image

def apply_cyberpunk_effect(image):
    """Apply cyberpunk style effects"""
    # Convert to RGB if not already
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Add blue/purple tint
    pixels = image.load()
    width, height = image.size
    
    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            # Enhance blue and reduce red for cyberpunk feel
            r = int(r * 0.8)
            g = int(g * 0.9)
            b = int(min(255, b * 1.3))
            pixels[x, y] = (r, g, b)
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.3)
    
    return image

def process_image(input_path, output_path, style):
    """Process image with the specified style"""
    try:
        # Open and convert image
        image = Image.open(input_path)
        image = image.convert('RGB')
        
        print(f"Processing image with style: {style}")
        
        # Apply style-based processing
        if style == 'oil_painting':
            image = apply_oil_painting_effect(image)
        elif style == 'anime':
            image = apply_anime_effect(image)
        elif style == 'pixel_art':
            image = apply_pixel_art_effect(image)
        elif style == 'watercolor':
            image = apply_watercolor_effect(image)
        elif style == 'van_gogh':
            image = apply_van_gogh_effect(image)
        elif style == 'cyberpunk':
            image = apply_cyberpunk_effect(image)
        else:
            # Default: slight enhancement
            enhancer = ImageEnhance.Color(image)
            image = enhancer.enhance(1.1)
        
        # Save processed image
        image.save(output_path, 'PNG')
        print(f"Processed image saved to: {output_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Basic Image Style Processing")
    parser.add_argument("--input", required=True, help="Input image path")
    parser.add_argument("--output", required=True, help="Output image path")
    parser.add_argument("--style", required=True, help="Style to apply")
    
    args = parser.parse_args()
    
    # Validate inputs
    if not os.path.exists(args.input):
        print(f"Error: Input file {args.input} does not exist")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    # Process the image
    process_image(args.input, args.output, args.style)

if __name__ == "__main__":
    main()