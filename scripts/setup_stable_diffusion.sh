#!/bin/bash

echo "Setting up Local Stable Diffusion for AI NFT Generator..."
echo "============================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install PyTorch (CPU version for broader compatibility)
echo "🔥 Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other required packages
echo "📚 Installing other dependencies..."
pip install diffusers transformers accelerate pillow safetensors

echo ""
echo "✅ Setup complete!"
echo ""
echo "To test the installation, run:"
echo "source venv/bin/activate"
echo "python3 scripts/stable_diffusion.py --help"
echo ""
echo "Note: The first time you run image generation, it will download the Stable Diffusion model (~4GB)"