import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { getCachedNetworkData } from '@/lib/liveData';
import { getNetworkInfo } from '@/lib/web3';

interface NetworkCardProps {
  chain: {
    id: number | string;
    key: string;
    name: string;
    icon: string;
    color: string;
    contractAddress: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export default function NetworkCard({ chain, isSelected, onSelect }: NetworkCardProps) {
  const { data: networkData, isLoading } = useQuery({
    queryKey: ['networkData', chain.id],
    queryFn: () => getCachedNetworkData(chain.id),
    refetchInterval: 60000, // Refresh every minute
    retry: 1,
  });

  return (
    <div
      className={`cursor-pointer p-3 rounded-lg border transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center">
        <div className={`w-8 h-8 ${chain.color} rounded-full flex items-center justify-center mr-3`}>
          <i className={`${chain.icon} text-sm text-white`}></i>
        </div>
        <div className="flex-1">
          <div className="font-medium">{chain.name}</div>
          <div className="text-xs text-muted-foreground flex items-center">
            {isLoading && (
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
            )}
            {networkData?.gasPrice || getNetworkInfo(chain.id).gasPrice} gas
          </div>
          {networkData?.priceUSD && (
            <div className="text-xs text-muted-foreground">
              ${networkData.priceUSD.toFixed(2)} {networkData.symbol}
            </div>
          )}
        </div>
        {isSelected && (
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        )}
      </div>
    </div>
  );
}