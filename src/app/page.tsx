// src/app/page.tsx

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { useVault, VaultItem } from '@/hooks/useVault';
import gsap from 'gsap';
import { 
  LogOut, 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Copy, 
  Image as ImageIcon,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { spaceGrotesk } from '@/utils/fonts';

export default function HomePage() {
  const router = useRouter();
  const { vaultItems, loading, createVaultItem, updateVaultItem, deleteVaultItem, getUniquePlatforms } = useVault();
  const { logout } = useAuth(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (navRef.current) {
        gsap.fromTo(
          navRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
      }
      
      if (searchRef.current) {
        gsap.fromTo(
          searchRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' }
        );
      }
      
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    try {
        logout();
        router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: VaultItem) => {
    setSelectedItem(item);
    setEditMode(true);
    setShowCreateModal(true);
  };

  const handleViewImage = (item: VaultItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (item: VaultItem) => {
    if (window.confirm(`Delete "${item.platform}"? This can't be undone, genius.`)) {
      try {
        await deleteVaultItem(item.id);
      } catch (err) {
        alert('Delete failed. Even that you messed up? 😂');
      }
    }
  };

  // Filter vault items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return vaultItems;
    
    const query = searchQuery.toLowerCase();
    return vaultItems.filter(item => 
      item.platform.toLowerCase().includes(query) ||
      item.username.toLowerCase().includes(query) ||
      item.comment.toLowerCase().includes(query) ||
      item.password.toLowerCase().includes(query)
    );
  }, [vaultItems, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav 
        ref={navRef}
        className="border-b border-[#1a1a1a] px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className={`text-2xl font-bold tracking-tight ${spaceGrotesk.className}`}>vault</h1>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors duration-200"
            title="Get out"
          >
            <LogOut size={20} className="text-[#888]" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div ref={searchRef} className="mb-8 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search your secrets..."
              className="w-full pl-12 pr-4 py-3 bg-[#111] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#333] transition-colors duration-200"
            />
          </div>
          
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#ddd] transition-colors duration-200"
          >
            <Plus size={18} />
            <span>NEW</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[#333] border-t-white rounded-full animate-spin" />
            <p className="text-[#666] text-sm mt-4">decrypting your mess...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && !searchQuery && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#111] flex items-center justify-center">
              <Plus size={32} className="text-[#333]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">nothing here yet</h3>
            <p className="text-[#666] text-sm mb-6">go ahead, trust me with your secrets</p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#ddd] transition-colors duration-200"
            >
              CREATE FIRST ENTRY
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <p className="text-[#666] text-sm">no matches for "{searchQuery}"</p>
            <p className="text-[#444] text-xs mt-2">did you even save that? 🤔</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filteredItems.length > 0 && (
          <div 
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredItems.map((item, index) => (
              <VaultCard
                key={item.id}
                item={item}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewImage={handleViewImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <VaultModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedItem(null);
            setEditMode(false);
          }}
          onSave={editMode ? updateVaultItem : createVaultItem}
          existingPlatforms={getUniquePlatforms()}
          editItem={editMode ? selectedItem : null}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <ViewModal
          item={selectedItem}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Vault Card Component
function VaultCard({ 
  item, 
  index, 
  onEdit, 
  onDelete, 
  onViewImage 
}: { 
  item: VaultItem; 
  index: number;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  onViewImage: (item: VaultItem) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.5, 
          delay: index * 0.05,
          ease: 'power2.out' 
        }
      );
    }
  }, [index]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Copy failed. Seriously? 😑');
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-[#111] border border-[#1a1a1a] rounded-lg p-5 hover:border-[#222] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1.5 truncate">{item.platform}</h3>
          {item.username && (
            <p className="text-[#aaa] text-sm font-medium truncate">{item.username}</p>
          )}
          {!item.username && (
            <p className="text-[#555] text-xs italic">no username</p>
          )}
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 flex-shrink-0">
          {item.imageUrl && (
            <button
              onClick={() => onViewImage(item)}
              className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
              title="View image"
            >
              <ImageIcon size={14} className="text-[#888]" />
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
            title="Edit"
          >
            <Edit2 size={14} className="text-[#888]" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
            title="Delete"
          >
            <Trash2 size={14} className="text-[#ff6666]" />
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="text-[#666] text-xs mb-1.5 block uppercase tracking-wide">Password</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded text-xs text-white font-mono truncate">
            {showPassword ? item.password : '•'.repeat(Math.min(item.password.length, 16))}
          </code>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 hover:bg-[#1a1a1a] rounded transition-colors duration-200 flex-shrink-0"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? 
              <EyeOff size={14} className="text-[#888]" /> : 
              <Eye size={14} className="text-[#888]" />
            }
          </button>
          <button
            onClick={() => handleCopy(item.password)}
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

      {/* Comment */}
      {item.comment && (
        <div className="mb-3">
          <label className="text-[#666] text-xs mb-1.5 block uppercase tracking-wide">Notes</label>
          <p className="text-[#888] text-xs leading-relaxed line-clamp-2">{item.comment}</p>
        </div>
      )}

      {/* Footer with date and indicators */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1a1a1a]">
        <p className="text-[#555] text-[10px] tracking-wide">
          {item.createdAt?.toDate().toLocaleDateString()}
        </p>
        <div className="flex gap-1.5">
          {item.imageUrl && (
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" title="Has image" />
          )}
          {item.comment && (
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" title="Has notes" />
          )}
        </div>
      </div>
    </div>
  );
}

// Modal Component for Create/Edit
function VaultModal({
  isOpen,
  onClose,
  onSave,
  existingPlatforms,
  editItem
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: any;
  existingPlatforms: string[];
  editItem: VaultItem | null;
}) {
  const [platform, setPlatform] = useState(editItem?.platform || '');
  const [username, setUsername] = useState(editItem?.username || '');
  const [password, setPassword] = useState(editItem?.password || '');
  const [comment, setComment] = useState(editItem?.comment || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editItem?.imageUrl || null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  const filteredPlatforms = useMemo(() => {
    if (!platform || !showSuggestions) return [];
    const query = platform.toLowerCase();
    return existingPlatforms.filter(p => 
      p.toLowerCase().includes(query) && p.toLowerCase() !== query
    );
  }, [platform, existingPlatforms, showSuggestions]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platform.trim() || !password.trim()) {
      alert('Platform and password are required, dummy! 😤');
      return;
    }

    setSaving(true);
    
    try {
      if (editItem) {
        await onSave(
          editItem.id,
          platform,
          username,
          password,
          comment,
          imageFile || undefined,
          !imageFile && !!editItem.imageUrl
        );
      } else {
        await onSave(platform, username, password, comment, imageFile || undefined);
      }
      
      onClose();
    } catch (err) {
      alert('Save failed. What did you do wrong this time? 🤦');
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
        className="relative w-full max-w-md bg-[#111] border border-[#222] rounded-lg p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editItem ? 'edit entry' : 'new entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors duration-200"
          >
            <X size={20} className="text-[#888]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform with Autocomplete */}
          <div className="relative">
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Platform *
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Google, Netflix, etc."
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200"
              required
            />
            {filteredPlatforms.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                {filteredPlatforms.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPlatform(p);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#888] hover:bg-[#111] hover:text-white transition-colors duration-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your@email.com or username"
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Password *
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="super secret stuff"
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors duration-200"
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

          {/* Image Upload */}
          <div>
            <label className="block text-[#888] text-xs mb-2 uppercase tracking-wide">
              Image (QR Code, etc.)
            </label>
            {imagePreview && (
              <div className="mb-3 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-32 object-contain bg-[#0a0a0a] border border-[#222] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/80 hover:bg-black rounded transition-colors duration-200"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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

// View Modal Component
function ViewModal({ item, onClose }: { item: VaultItem; onClose: () => void }) {
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
        className="relative w-full max-w-lg bg-[#111] border border-[#222] rounded-lg p-6"
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

        {/* Image */}
        {item.imageUrl && (
          <div className="mb-6">
            <img 
              src={item.imageUrl} 
              alt={item.platform}
              className="w-full max-h-80 object-contain bg-[#0a0a0a] border border-[#222] rounded-lg"
            />
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
            <p className="text-white text-sm leading-relaxed">{item.comment}</p>
          </div>
        )}
      </div>
    </div>
  );
}
