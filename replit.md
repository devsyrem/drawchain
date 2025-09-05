# Overview

This is an AI NFT Generator application that allows users to upload images, apply AI-powered artistic style transformations, and mint the generated artwork as NFTs on blockchain networks. The application provides a complete workflow from image upload to NFT minting with support for multiple blockchain networks and artistic styles.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **Framework**: React with TypeScript for type safety
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable UI components
- **Styling**: Tailwind CSS with custom CSS variables for theming support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks for local component state
- **Data Fetching**: TanStack Query (React Query) for server state management and caching

## Backend Architecture

The backend uses Express.js with TypeScript in a monorepo structure:

- **Framework**: Express.js with TypeScript for the REST API server
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Uploads**: Multer for handling multipart form data
- **Development**: Vite for fast development builds and hot module replacement

## Database Schema

PostgreSQL database with Drizzle ORM managing two main entities:

- **nft_generations**: Tracks AI image generation requests with fields for original image URL, generated image URL, style selection, custom prompts, and generation status
- **nft_mints**: Records NFT minting operations with blockchain details including wallet address, transaction hash, token ID, and IPFS metadata URLs

## File Storage Strategy

The application uses a dual storage approach:

- **Object Storage Service**: Custom implementation using Google Cloud Storage for file persistence with ACL-based access control
- **File Upload Flow**: Direct upload URLs for efficient file transfers without server bottlenecks

## Web3 Integration

Blockchain connectivity is handled through browser-based Web3 providers:

- **Wallet Connection**: MetaMask and other Web3 wallets via window.ethereum API
- **Multi-chain Support**: Ethereum and Base networks with extensible architecture for additional chains
- **NFT Minting**: Smart contract interactions for on-chain NFT creation

## AI Image Generation

The application uses **local Stable Diffusion** for AI image transformation:

- **Local Processing**: Uses CompVis/stable-diffusion via Python script for full control and no API costs
- **Style Options**: Predefined artistic styles (oil painting, anime, pixel art, watercolor, Van Gogh, cyberpunk)
- **Custom Prompts**: User-defined text prompts for personalized transformations
- **Processing Pipeline**: Asynchronous generation with status tracking using Python subprocess
- **Dependencies**: Requires Python 3.11+ with torch, diffusers, transformers, pillow packages

## Development Environment

Modern development setup optimized for productivity:

- **Monorepo Structure**: Client and server code organized with shared TypeScript types
- **Hot Reloading**: Vite development server with React Fast Refresh
- **Type Safety**: Shared schema definitions between frontend and backend
- **Path Aliases**: Configured imports for clean, maintainable code organization

# External Dependencies

## Core Framework Dependencies
- **React**: Frontend framework with hooks and modern patterns
- **Express.js**: Node.js web application framework for REST API
- **Drizzle ORM**: Type-safe PostgreSQL database toolkit
- **Vite**: Build tool and development server

## UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built component library

## Database and Storage
- **PostgreSQL**: Primary database (configured via Drizzle for Neon Database)
- **Google Cloud Storage**: Object storage for file management

## File Upload and Processing
- **Multer**: Express middleware for handling multipart/form-data
- **Uppy**: File upload library with dashboard UI

## Web3 and Blockchain
- **MetaMask**: Browser wallet integration via window.ethereum
- **IPFS**: Distributed storage for NFT metadata

## Development Tools
- **TypeScript**: Type safety across the entire application
- **TanStack Query**: Data fetching and caching
- **Wouter**: Lightweight routing library
- **ESBuild**: Fast JavaScript bundler for production builds