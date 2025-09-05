import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GenerationState } from '@/types';
import { Sparkles, RotateCcw, Download, ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GeneratedImageProps {
  generationState: GenerationState;
  setGenerationState: (state: GenerationState | ((prev: GenerationState) => GenerationState)) => void;
}

function GeneratingProgress() {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Initializing AI model...');

  useEffect(() => {
    const stages = [
      'Initializing AI model...',
      'Analyzing your image...',
      'Applying style transformation...',
      'Enhancing details...',
      'Finalizing artwork...'
    ];

    let currentStageIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      progressValue += Math.random() * 4 + 1; // Increase by 1-5% each time
      
      if (progressValue >= 100) {
        progressValue = 100;
        setCurrentStage('Complete!');
        clearInterval(interval);
      } else {
        // Change stage every ~20% progress
        const newStageIndex = Math.floor(progressValue / 20);
        if (newStageIndex !== currentStageIndex && newStageIndex < stages.length) {
          currentStageIndex = newStageIndex;
          setCurrentStage(stages[currentStageIndex]);
        }
      }
      
      setProgress(progressValue);
    }, 800); // Update every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 gradient-purple rounded-full flex items-center justify-center animate-pulse">
        <i className="fas fa-cog animate-spin text-3xl text-white"></i>
      </div>
      <p className="text-lg text-primary mb-2">AI is creating your artwork...</p>
      <p className="text-sm text-muted-foreground mb-4">{currentStage}</p>
      
      {/* Progress Bar */}
      <div className="w-80 h-3 mx-auto mt-4 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
    </div>
  );
}

export default function GeneratedImage({ generationState, setGenerationState }: GeneratedImageProps) {
  const handleDownload = () => {
    if (generationState.generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generationState.generatedImageUrl;
      link.download = 'ai-generated-artwork.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRegenerate = () => {
    setGenerationState(prev => ({
      ...prev,
      generatedImageUrl: null,
    }));
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Sparkles className="text-primary mr-3" size={24} />
          Generated Artwork
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generationState.isGenerating ? (
          // Loading State with Progress Bar
          <GeneratingProgress />
        ) : generationState.generatedImageUrl ? (
          // Generated Image Display
          <div className="space-y-6">
            <img
              src={generationState.generatedImageUrl}
              alt="AI-generated artwork"
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
            
            <div className="flex gap-4">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="mr-2" size={16} />
                Regenerate
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2" size={16} />
                Download
              </Button>
            </div>
          </div>
        ) : (
          // Default State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-full flex items-center justify-center">
              <ImageIcon className="text-3xl text-muted-foreground" size={48} />
            </div>
            <p className="text-lg text-muted-foreground">Your AI-generated artwork will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
