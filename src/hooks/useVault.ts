// src/hooks/useVault.ts

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface VaultItem {
  id: string;
  platform: string;
  username: string;
  password: string;
  comment: string;
  imageUrl?: string;
  imagePath?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useVault = () => {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all vault items
  const fetchVaultItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const q = query(collection(db, 'vault'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const items: VaultItem[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VaultItem));
      
      setVaultItems(items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vault items');
      console.error('Error fetching vault:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to storage
  const uploadImage = async (file: File): Promise<{ url: string; path: string }> => {
    try {
      const timestamp = Date.now();
      const imagePath = `vault-images/${timestamp}_${file.name}`;
      const storageRef = ref(storage, imagePath);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return { url, path: imagePath };
    } catch (err: any) {
      throw new Error('Image upload failed: ' + err.message);
    }
  };

  // Create new vault item
  const createVaultItem = async (
    platform: string,
    username: string,
    password: string,
    comment: string,
    imageFile?: File
  ) => {
    try {
      setError(null);
      
      let imageData = {};
      if (imageFile) {
        const { url, path } = await uploadImage(imageFile);
        imageData = { imageUrl: url, imagePath: path };
      }
      
      const docRef = await addDoc(collection(db, 'vault'), {
        platform: platform.trim(),
        username: username.trim(),
        password,
        comment: comment.trim(),
        ...imageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await fetchVaultItems();
      return docRef.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create vault item');
      throw err;
    }
  };

  // Update vault item
  const updateVaultItem = async (
    itemId: string,
    platform: string,
    username: string,
    password: string,
    comment: string,
    imageFile?: File,
    keepExistingImage?: boolean
  ) => {
    try {
      setError(null);
      
      const docRef = doc(db, 'vault', itemId);
      let updateData: any = {
        platform: platform.trim(),
        username: username.trim(),
        password,
        comment: comment.trim(),
        updatedAt: serverTimestamp()
      };
      
      if (imageFile) {
        const { url, path } = await uploadImage(imageFile);
        updateData.imageUrl = url;
        updateData.imagePath = path;
      } else if (!keepExistingImage) {
        updateData.imageUrl = null;
        updateData.imagePath = null;
      }
      
      await updateDoc(docRef, updateData);
      await fetchVaultItems();
    } catch (err: any) {
      setError(err.message || 'Failed to update vault item');
      throw err;
    }
  };

  // Delete vault item
  const deleteVaultItem = async (itemId: string) => {
    try {
      setError(null);
      const docRef = doc(db, 'vault', itemId);
      await deleteDoc(docRef);
      await fetchVaultItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete vault item');
      throw err;
    }
  };

  // Get unique platforms for autocomplete
  const getUniquePlatforms = (): string[] => {
    const platforms = vaultItems.map(item => item.platform);
    return Array.from(new Set(platforms)).sort();
  };

  useEffect(() => {
    fetchVaultItems();
  }, []);

  return {
    vaultItems,
    loading,
    error,
    createVaultItem,
    updateVaultItem,
    deleteVaultItem,
    refreshVault: fetchVaultItems,
    getUniquePlatforms
  };
};
