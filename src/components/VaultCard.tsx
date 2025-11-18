// src/components/VaultCard.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import { VaultItem } from '@/hooks/useVault';
import { Edit2, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { FileIcon } from './FileIcon';
import gsap from 'gsap';

interface VaultCardProps {
  item: VaultItem;
  index: number;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  onView: (item: VaultItem) => void;
}

export function VaultCard({ item, index, onEdit, onDelete, onView }: VaultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: index * 0.05, ease: 'power2.out' }
      );
    }
  }, [index]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleTogglePassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onView(item)}
      className="group relative p-5 bg-[#111] border border-[#222] rounded-lg hover:border-[#333] transition-all duration-200 cursor-pointer"
    >
      {/* Edit/Delete buttons - show on hover */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1.5 bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded transition-colors duration-200"
          title="Edit"
        >
          <Edit2 size={14} className="text-[#888]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="p-1.5 bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded transition-colors duration-200"
          title="Delete"
        >
          <Trash2 size={14} className="text-[#888]" />
        </button>
      </div>

      {/* Platform name */}
      <h3 className="text-lg font-semibold mb-3 pr-16">{item.platform}</h3>

      {/* Username */}
      {item.username && (
        <p className="text-sm text-[#888] mb-3">{item.username}</p>
      )}

      {/* Password */}
      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
        <label className="text-[#666] text-xs mb-1.5 block hidden uppercase tracking-wide">Password</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded text-xs text-white font-mono truncate">
            {showPassword ? item.password : '•'.repeat(Math.min(item.password.length, 16))}
          </code>
          <button
            onClick={handleTogglePassword}
            className="p-2 hover:bg-[#1a1a1a] rounded transition-colors duration-200 flex-shrink-0"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? 
              <EyeOff size={14} className="text-[#888]" /> : 
              <Eye size={14} className="text-[#888]" />
            }
          </button>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-[#1a1a1a] rounded transition-colors duration-200 flex-shrink-0"
            title="Copy password"
          >
            {copied ? 
              <Check size={14} className="text-green-500" /> : 
              <Copy size={14} className="text-[#888]" />
            }
          </button>
        </div>
      </div>

      {/* File indicator */}
      {item.fileUrl && (
        <div className="flex items-center gap-2 text-[#666]">
          <FileIcon fileType={item.fileType} size={16} />
          <span className="text-xs truncate max-w-[200px]">{item.fileName}</span>
        </div>
      )}

      {/* Comment preview */}
      {item.comment && !item.fileUrl && (
        <p className="text-xs text-[#555] line-clamp-2">{item.comment}</p>
      )}
    </div>
  );
}
