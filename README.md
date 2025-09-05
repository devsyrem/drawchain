# AI NFT Generator

Transform your sketches into stylized artwork using local Stable Diffusion and mint them as NFTs on multiple blockchains.

## Features

- **Local AI Processing**: Uses CompVis/stable-diffusion locally (no API costs)
- **Multiple Art Styles**: Oil painting, anime, pixel art, watercolor, Van Gogh, cyberpunk
- **Cross-Chain NFT Minting**: Support for Ethereum, Base, and more
- **IPFS Storage**: Decentralized metadata storage
- **Web3 Integration**: MetaMask wallet connection

## Quick Start

1. **Run the Application**
   ```bash
   npm run dev
   ```

2. **Set up Local Stable Diffusion** (for full AI features)
   ```bash
   ./scripts/setup_stable_diffusion.sh
   ```

3. **Upload an image** and choose your art style

4. **Connect your wallet** to mint NFTs

## Python Dependencies

The application works in fallback mode without Python dependencies, but for full AI generation, install:

```bash
# Using the setup script (recommended)
./scripts/setup_stable_diffusion.sh

# Or manually
pip install torch torchvision diffusers transformers pillow accelerate
```

## Architecture

- **Frontend**: React + TypeScript with Shadcn/UI components
- **Backend**: Express.js with object storage
- **AI Processing**: Local Python script using CompVis/stable-diffusion
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Web3 integration for multi-chain NFT minting

## Development

The application automatically falls back to returning the original image when Python dependencies aren't available, with clear instructions for users to install the full AI capabilities.