import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const nftGenerations = pgTable("nft_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalImageUrl: text("original_image_url").notNull(),
  generatedImageUrl: text("generated_image_url"),
  style: text("style").notNull(),
  customPrompt: text("custom_prompt"),
  status: text("status").notNull().default("generating"), // generating, completed, failed
  metadata: jsonb("metadata"), // NFT metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const nftMints = pgTable("nft_mints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  generationId: varchar("generation_id").references(() => nftGenerations.id),
  walletAddress: text("wallet_address").notNull(),
  blockchain: text("blockchain").notNull(),
  tokenId: text("token_id"),
  transactionHash: text("transaction_hash"),
  contractAddress: text("contract_address"),
  ipfsMetadataUrl: text("ipfs_metadata_url"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNftGenerationSchema = createInsertSchema(nftGenerations).omit({
  id: true,
  createdAt: true,
});

export const insertNftMintSchema = createInsertSchema(nftMints).omit({
  id: true,
  createdAt: true,
});

export type InsertNftGeneration = z.infer<typeof insertNftGenerationSchema>;
export type NftGeneration = typeof nftGenerations.$inferSelect;
export type InsertNftMint = z.infer<typeof insertNftMintSchema>;
export type NftMint = typeof nftMints.$inferSelect;
