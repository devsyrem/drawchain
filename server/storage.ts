import { type NftGeneration, type InsertNftGeneration, type NftMint, type InsertNftMint } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // NFT Generation methods
  createGeneration(generation: InsertNftGeneration): Promise<NftGeneration>;
  getGeneration(id: string): Promise<NftGeneration | undefined>;
  updateGeneration(id: string, updates: Partial<NftGeneration>): Promise<NftGeneration | undefined>;
  
  // NFT Mint methods
  createMint(mint: InsertNftMint): Promise<NftMint>;
  getMint(id: string): Promise<NftMint | undefined>;
  updateMint(id: string, updates: Partial<NftMint>): Promise<NftMint | undefined>;
  getMintsByGeneration(generationId: string): Promise<NftMint[]>;
}

export class MemStorage implements IStorage {
  private generations: Map<string, NftGeneration>;
  private mints: Map<string, NftMint>;

  constructor() {
    this.generations = new Map();
    this.mints = new Map();
  }

  async createGeneration(insertGeneration: InsertNftGeneration): Promise<NftGeneration> {
    const id = randomUUID();
    const generation: NftGeneration = { 
      ...insertGeneration,
      id,
      generatedImageUrl: insertGeneration.generatedImageUrl || null,
      customPrompt: insertGeneration.customPrompt || null,
      status: insertGeneration.status || "generating",
      metadata: insertGeneration.metadata || null,
      createdAt: new Date()
    };
    this.generations.set(id, generation);
    return generation;
  }

  async getGeneration(id: string): Promise<NftGeneration | undefined> {
    return this.generations.get(id);
  }

  async updateGeneration(id: string, updates: Partial<NftGeneration>): Promise<NftGeneration | undefined> {
    const existing = this.generations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.generations.set(id, updated);
    return updated;
  }

  async createMint(insertMint: InsertNftMint): Promise<NftMint> {
    const id = randomUUID();
    const mint: NftMint = { 
      ...insertMint,
      id,
      generationId: insertMint.generationId || null,
      tokenId: insertMint.tokenId || null,
      transactionHash: insertMint.transactionHash || null,
      contractAddress: insertMint.contractAddress || null,
      ipfsMetadataUrl: insertMint.ipfsMetadataUrl || null,
      status: insertMint.status || "pending",
      createdAt: new Date()
    };
    this.mints.set(id, mint);
    return mint;
  }

  async getMint(id: string): Promise<NftMint | undefined> {
    return this.mints.get(id);
  }

  async updateMint(id: string, updates: Partial<NftMint>): Promise<NftMint | undefined> {
    const existing = this.mints.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.mints.set(id, updated);
    return updated;
  }

  async getMintsByGeneration(generationId: string): Promise<NftMint[]> {
    return Array.from(this.mints.values()).filter(mint => mint.generationId === generationId);
  }
}

export const storage = new MemStorage();
