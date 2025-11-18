// src/app/page.tsx

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useVault, VaultItem } from '@/hooks/useVault';
import gsap from 'gsap';
import { LogOut, Plus, Search } from 'lucide-react';
import { spaceGrotesk } from '@/utils/fonts';
import { VaultCard } from '@/components/VaultCard';
import { VaultModal } from '@/components/VaultModal';
import { ViewModal } from '@/components/ViewModal';

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

  const handleViewItem = (item: VaultItem) => {
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
                onView={handleViewItem}
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
