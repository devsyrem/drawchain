export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface GenerationState {
  isGenerating: boolean;
  originalImage: File | null;
  generatedImageUrl: string | null;
  selectedStyle: string;
  customPrompt: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

export interface MintState {
  isMinting: boolean;
  selectedChain: string;
  nftMetadata: Partial<NFTMetadata>;
}

export type ArtStyle = 'oil_painting' | 'anime' | 'pixel_art' | 'watercolor' | 'van_gogh' | 'cyberpunk';

export interface StyleOption {
  key: ArtStyle;
  label: string;
  icon: string;
  gradient: string;
}
