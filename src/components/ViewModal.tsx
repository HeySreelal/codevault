// src/components/ViewModal.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { VaultItem } from '@/hooks/useVault';
import { Eye, EyeOff, Copy, Check, X } from 'lucide-react';
import { FilePreview } from './FilePreview';
import gsap from 'gsap';

interface ViewModalProps {
  item: VaultItem;
  onClose: () => void;
}

export function ViewModal({ item, onClose }: ViewModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Copy failed. Really? 😑');
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{item.platform}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
          >
            <X size={20} className="text-[#888]" />
          </button>
        </div>

        {/* File Preview */}
        {item.fileUrl && (
          <div className="mb-6">
            <FilePreview item={item} />
          </div>
        )}

        {/* Password */}
        <div className="mb-4">
          <label className="block text-[#666] text-xs mb-2">PASSWORD</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white font-mono break-all">
              {showPassword ? item.password : '•'.repeat(item.password.length)}
            </code>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-3 hover:bg-[#1a1a1a] rounded-lg transition-colors duration-200"
            >
              {showPassword ? 
                <EyeOff size={18} className="text-[#888]" /> : 
                <Eye size={18} className="text-[#888]" />
              }
            </button>
            <button
              onClick={() => handleCopy(item.password)}
              className="p-3 hover:bg-[#1a1a1a] rounded-lg transition-colors duration-200"
            >
              {copied ? 
                <Check size={18} className="text-green-500" /> : 
                <Copy size={18} className="text-[#888]" />
              }
            </button>
          </div>
        </div>

        {/* Username */}
        {item.username && (
          <div className="mb-4">
            <label className="block text-[#666] text-xs mb-2">USERNAME</label>
            <p className="text-white text-sm">{item.username}</p>
          </div>
        )}

        {/* Comment */}
        {item.comment && (
          <div>
            <label className="block text-[#666] text-xs mb-2">NOTES</label>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{item.comment}</p>
          </div>
        )}
      </div>
    </div>
  );
}
