import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GenerationState } from '@/types';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  generationState: GenerationState;
  setGenerationState: (state: GenerationState | ((prev: GenerationState) => GenerationState)) => void;
}

export default function ImageUpload({ generationState, setGenerationState }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      setGenerationState(prev => ({
        ...prev,
        originalImage: file,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveImage = () => {
    setGenerationState(prev => ({
      ...prev,
      originalImage: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Upload className="text-primary mr-3" size={24} />
          Upload Your Sketch
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!generationState.originalImage ? (
          <div
            className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors duration-300 cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto gradient-purple rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="text-2xl text-white" size={32} />
              </div>
              <div>
                <p className="text-lg font-medium text-muted-foreground">Drop your image here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-2">Supports JPG, PNG, GIF up to 10MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={URL.createObjectURL(generationState.originalImage)}
                alt="Uploaded sketch preview"
                className="w-full h-64 object-cover rounded-xl"
              />
              <Button
                onClick={handleRemoveImage}
                size="icon"
                variant="destructive"
                className="absolute top-3 right-3"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{generationState.originalImage.name}</p>
              <p>{(generationState.originalImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
