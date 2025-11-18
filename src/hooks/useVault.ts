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
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
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

  // Upload file to storage
  const uploadFile = async (file: File): Promise<{ url: string; path: string; name: string; type: string; size: number }> => {
    try {
      const timestamp = Date.now();
      const filePath = `vault-files/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return { 
        url, 
        path: filePath,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (err: any) {
      throw new Error('File upload failed: ' + err.message);
    }
  };

  // Create new vault item
  const createVaultItem = async (
    platform: string,
    username: string,
    password: string,
    comment: string,
    file?: File
  ) => {
    try {
      setError(null);
      
      let fileData = {};
      if (file) {
        const { url, path, name, type, size } = await uploadFile(file);
        fileData = { 
          fileUrl: url, 
          filePath: path,
          fileName: name,
          fileType: type,
          fileSize: size
        };
      }
      
      const docRef = await addDoc(collection(db, 'vault'), {
        platform: platform.trim(),
        username: username.trim(),
        password,
        comment: comment.trim(),
        ...fileData,
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
    file?: File,
    keepExistingFile?: boolean
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
      
      if (file) {
        const { url, path, name, type, size } = await uploadFile(file);
        updateData.fileUrl = url;
        updateData.filePath = path;
        updateData.fileName = name;
        updateData.fileType = type;
        updateData.fileSize = size;
      } else if (!keepExistingFile) {
        updateData.fileUrl = null;
        updateData.filePath = null;
        updateData.fileName = null;
        updateData.fileType = null;
        updateData.fileSize = null;
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
