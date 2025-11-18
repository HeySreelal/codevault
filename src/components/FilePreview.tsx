// src/components/FilePreview.tsx

import { Download } from 'lucide-react';
import { VaultItem } from '@/hooks/useVault';
import { FileIcon } from './FileIcon';

interface FilePreviewProps {
  item: VaultItem;
}

export function FilePreview({ item }: FilePreviewProps) {
  const isImage = item.fileType?.startsWith('image/');

  const handleDownload = () => {
    if (item.fileUrl) {
      const link = document.createElement('a');
      link.href = item.fileUrl;
      link.download = item.fileName || 'download';
      link.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[#666] text-xs">ATTACHED FILE</label>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded text-xs text-white transition-colors duration-200"
        >
          <Download size={14} />
          <span>DOWNLOAD</span>
        </button>
      </div>

      {isImage ? (
        <img 
          src={item.fileUrl} 
          alt={item.fileName}
          className="w-full rounded-lg border border-[#222] bg-[#0a0a0a]"
        />
      ) : (
        <div className="p-4 bg-[#0a0a0a] border border-[#222] rounded-lg flex items-center gap-3">
          <FileIcon fileType={item.fileType} size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{item.fileName}</p>
            <p className="text-xs text-[#666]">{item.fileType}</p>
          </div>
        </div>
      )}
    </div>
  );
}
