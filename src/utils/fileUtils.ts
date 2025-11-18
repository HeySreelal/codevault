// src/utils/fileUtils.ts

export const isImageFile = (fileType?: string): boolean => {
  if (!fileType) return false;
  return fileType.startsWith('image/');
};

export const getFileIcon = (fileType?: string): string => {
  if (!fileType) return 'file';
  
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'pdf';
  if (fileType.startsWith('text/') || fileType === 'application/json') return 'text';
  if (fileType.includes('document') || fileType.includes('word')) return 'document';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'spreadsheet';
  
  return 'file';
};

export const getFileExtension = (fileName?: string): string => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
};
