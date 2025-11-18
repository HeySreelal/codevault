// src/components/FileIcon.tsx

import { FileText, File, FileArchive, Image as ImageIcon } from 'lucide-react';

interface FileIconProps {
  fileType?: string;
  size?: number;
}

export function FileIcon({ fileType = '', size = 20 }: FileIconProps) {
  const className = "text-[#666]";
  
  if (fileType.startsWith('image/')) {
    return <ImageIcon size={size} className={className} />;
  }
  
  if (fileType === 'application/pdf' || fileType.includes('text')) {
    return <FileText size={size} className={className} />;
  }
  
  if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('compressed')) {
    return <FileArchive size={size} className={className} />;
  }
  
  return <File size={size} className={className} />;
}
