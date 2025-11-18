// src/components/VaultModal.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { VaultItem } from '@/hooks/useVault';
import { X } from 'lucide-react';
import { FileIcon } from './FileIcon';
import gsap from 'gsap';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  existingPlatforms: string[];
  editItem?: VaultItem | null;
}

export function VaultModal({ isOpen, onClose, onSave, existingPlatforms, editItem }: VaultModalProps) {
  const [platform, setPlatform] = useState(editItem?.platform || '');
  const [username, setUsername] = useState(editItem?.username || '');
  const [password, setPassword] = useState(editItem?.password || '');
  const [comment, setComment] = useState(editItem?.comment || '');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isImage = file?.type.startsWith('image/');

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const filteredSuggestions = platform
    ? existingPlatforms.filter(p => 
        p.toLowerCase().includes(platform.toLowerCase()) && p !== platform
      )
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File too big. Max 5MB. What are you uploading? 😑');
        return;
      }

      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platform.trim() || !password.trim()) {
      alert('Platform and password required. Obviously. 🙄');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        platform: platform.trim(),
        username: username.trim(),
        password: password.trim(),
        comment: comment.trim(),
        file: file,
        id: editItem?.id
      });
      onClose();
    } catch (err) {
      alert('Save failed. Nice job breaking it. 😑');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === modalRef.current) onClose();
      }}
    >
      <div 
        ref={contentRef}
        className="relative w-full max-w-lg bg-[#111] border border-[#222] rounded-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{editItem ? 'edit entry' : 'new entry'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
          >
            <X size={20} className="text-[#888]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Platform */}
          <div className="relative">
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="google, github, etc."
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200"
              required
            />
            
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden z-10">
                {filteredSuggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setPlatform(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#888] hover:bg-[#111] transition-colors duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Username/Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username or email"
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="the secret sauce"
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200 font-mono"
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="any notes? backup codes?"
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200 resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              File (QR Code, Recovery Codes, etc.) - Max 5MB
            </label>
            
            {/* File Preview */}
            {filePreview && isImage && (
              <div className="mb-3 relative">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-full h-32 object-contain bg-[#0a0a0a] border border-[#222] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/80 hover:bg-black rounded transition-colors duration-200"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}
            
            {/* Non-image file info */}
            {file && !isImage && (
              <div className="mb-3 p-3 bg-[#0a0a0a] border border-[#222] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileIcon fileType={file.type} size={24} />
                  <div>
                    <p className="text-sm text-white truncate max-w-[250px]">{file.name}</p>
                    <p className="text-xs text-[#666]">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                  className="p-1 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
                >
                  <X size={16} className="text-[#888]" />
                </button>
              </div>
            )}
            
            {/* Existing file info (edit mode) */}
            {editItem?.fileUrl && !file && (
              <div className="mb-3 p-3 bg-[#0a0a0a] border border-[#222] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileIcon fileType={editItem.fileType} size={24} />
                  <div>
                    <p className="text-sm text-white truncate max-w-[250px]">{editItem.fileName}</p>
                    {editItem.fileSize && (
                      <p className="text-xs text-[#666]">{formatFileSize(editItem.fileSize)}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilePreview(null)}
                  className="p-1 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
                  title="Remove file"
                >
                  <X size={16} className="text-[#888]" />
                </button>
              </div>
            )}
            
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-[#888] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-white file:text-black hover:file:bg-[#ddd] file:cursor-pointer cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-white text-sm font-semibold rounded-lg hover:bg-[#222] transition-colors duration-200"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#ddd] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
