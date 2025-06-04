// src/context/products-context.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/types/product';
import { useAuth } from './auth-context'; // Import useAuth to get the user's ID

interface ProductsContextType {
  products: Product[]; // All products, if you have a public listing
  userProducts: Product[]; // Products owned by the current user
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  fetchUserProducts: () => Promise<void>; // Function to refresh user's products
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth(); // Get user and token from auth context
  const [products, setProducts] = useState<Product[]>([]); // All products (optional)
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"; // Your backend API base URL

  // Function to fetch products owned by the logged-in user
  const fetchUserProducts = async () => {
    if (!user || !token) {
      setUserProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming your backend has an endpoint like /api/products/my for user-specific products
      const response = await fetch(`${API_BASE_URL}/products/my`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token for authentication
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ao carregar seus produtos: ${response.statusText}`);
      }
      const data = await response.json();
      // ⭐ Map backend data to frontend Product type if necessary ⭐
      // Example: if backend returns 'bdPrecoAluguel' and frontend expects 'price'
      const mappedProducts = data.map((item: any) => ({
        id: item.bdChave, // Map bdChave to id
        name: item.bdNome,
        description: item.bdDescricao,
        category: item.bdCategoria,
        image: item.bdURLIMG,
        price: item.bdPrecoAluguel, // Map bdPrecoAluguel to price
        originalPrice: item.bdPrecoOriginal || undefined, // Assuming a bdPrecoOriginal
        stock: item.bdEstoque, // Assuming a bdEstoque column
        brand: item.bdMarca, // Assuming a bdMarca column
        isNew: item.bdNovo, // Assuming a bdNovo column
      }));

      setUserProducts(mappedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar produtos.");
      console.error("Fetch user products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProducts();
  }, [user, token]); // Re-fetch when user or token changes

  const addProduct = async (productData: Partial<Product>) => {
    if (!user || !token) {
      throw new Error("Usuário não autenticado.");
    }
    setError(null);
    try {
      const payload = {
        bdChaveCli: user.id, // Pass the user's ID
        bdNome: productData.name,
        bdDescricao: productData.description,
        bdCategoria: productData.category,
        bdURLIMG: productData.image,
        bdPrecoAluguel: productData.price, // Map price to bdPrecoAluguel
        bdPrecoOriginal: productData.originalPrice, // Optional mapping
        bdEstoque: productData.stock, // Optional mapping
        bdMarca: productData.brand, // Optional mapping
        bdNovo: productData.isNew, // Optional mapping
        // bdEstado and bdAtivo will likely be set by the backend defaults or logic
      };

      const response = await fetch(`${API_BASE_URL}/products`, { // Your backend API endpoint for adding products
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao adicionar produto: ${response.statusText}`);
      }

      // After successful addition, refetch user products to update the list
      await fetchUserProducts();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar produto.");
      console.error("Add product error:", err);
      throw err; // Re-throw to be caught by ProductForm
    }
  };

  const updateProduct = async (productData: Product) => {
    if (!user || !token) {
      throw new Error("Usuário não autenticado.");
    }
    setError(null);
    try {
      const payload = {
        bdNome: productData.name,
        bdDescricao: productData.description,
        bdCategoria: productData.category,
        bdURLIMG: productData.image,
        bdPrecoAluguel: productData.price,
        bdPrecoOriginal: productData.originalPrice,
        bdEstoque: productData.stock,
        bdMarca: productData.brand,
        bdNovo: productData.isNew,
      };

      const response = await fetch(`${API_BASE_URL}/products/${productData.id}`, { // Endpoint for updating
        method: 'PUT', // Or PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao atualizar produto: ${response.statusText}`);
      }

      await fetchUserProducts();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto.");
      console.error("Update product error:", err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!user || !token) {
      throw new Error("Usuário não autenticado.");
    }
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao excluir produto: ${response.statusText}`);
      }

      await fetchUserProducts();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir produto.");
      console.error("Delete product error:", err);
      throw err;
    }
  };

  return (
    <ProductsContext.Provider value={{ products, userProducts, addProduct, updateProduct, deleteProduct, fetchUserProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};