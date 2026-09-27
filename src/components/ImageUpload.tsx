import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  hasImage: boolean;
  /** What this tool's input actually is, for the dropzone copy. */
  label?: string;
}

export const ImageUpload = ({ onImageUpload, hasImage, label = 'screenshot' }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.match(/image\/(png|jpeg|webp)/)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageUpload(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageUpload(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 p-8 rounded-lg border border-dashed transition-colors duration-200 cursor-pointer group',
        isDragging
          ? 'border-foreground bg-secondary'
          : hasImage
          ? 'border-foreground/40 bg-secondary/40 hover:bg-secondary'
          : 'hairline hover:border-foreground/30 hover:bg-secondary/60'
      )}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className={cn(
          'p-3 rounded-lg transition-colors duration-150',
          isDragging
            ? 'bg-foreground/10'
            : hasImage
            ? 'bg-secondary'
            : 'bg-secondary group-hover:bg-secondary/80'
        )}
      >
        {hasImage ? (
          <CheckCircle className="w-6 h-6 text-foreground" />
        ) : isDragging ? (
          <ImageIcon className="w-6 h-6 text-foreground" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-sm text-foreground">
          {hasImage ? `Replace ${label}` : isDragging ? 'Drop to upload' : `Drop ${label} here`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {hasImage
            ? 'Click or drag a new file'
            : 'or click to browse · PNG, JPG, WebP · or Ctrl+V to paste'}
        </p>
      </div>
    </div>
  );
};
