import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  imageName?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName = 'Image',
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in"
    >
      <div className="absolute top-4 right-4 flex items-center space-x-3 z-10">
        <a
          href={imageUrl}
          download={imageName}
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl"
      >
        <img
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-[85vh] object-contain rounded-xl select-auto"
        />
      </div>

      <p className="mt-3 text-xs text-white/70 font-medium">{imageName}</p>
    </div>
  );
};
