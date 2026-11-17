import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../api/api';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    coffee_house_name: "Ever Coffee House",
    welcome_message: "Welcome to Ever Coffee House! Browse our freshly brewed coffee, refreshing drinks, and delicious snacks.",
    welcome_message_am: "እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።",
    logo_url: "",
    phone: "0970414440",
    address: "Addis Ababa, Ethiopia"
  });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'drinks', 'foods'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isMobileQrOpen, setIsMobileQrOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'drinks', 'foods-snacks', 'available'
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadAllData = useCallback(async () => {
    try {
      const [catsData, prodsData, statsData, settingsData] = await Promise.all([
        api.getCategories().catch(() => null),
        api.getProducts().catch(() => null),
        api.getStats().catch(() => null),
        api.getSettings().catch(() => null)
      ]);
      if (Array.isArray(catsData)) {
        setCategories(catsData);
      }
      if (Array.isArray(prodsData)) {
        setProducts(prodsData);
      }
      if (statsData) setStats(statsData);
      if (settingsData && Object.keys(settingsData).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (err) {
      console.error('Error synchronizing live menu data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove product immediately from local state (optimistic instant update)
  const removeProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== Number(id)));
  }, []);

  // Update or insert product immediately in local state
  const upsertProduct = useCallback((item) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...item };
        return copy;
      }
      return [item, ...prev];
    });
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Sync automatically when window receives focus (cross-tab / mobile resume sync)
  useEffect(() => {
    const handleFocus = () => {
      loadAllData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadAllData]);

  // Periodic background synchronization every 15 seconds so customer devices stay live
  useEffect(() => {
    const timer = setInterval(() => {
      loadAllData();
    }, 15000);
    return () => clearInterval(timer);
  }, [loadAllData]);

  // Automatically close product detail modal if item was deleted
  useEffect(() => {
    if (selectedProduct && !products.some((p) => p.id === selectedProduct.id)) {
      setSelectedProduct(null);
    }
  }, [products, selectedProduct]);

  useEffect(() => {
    if (settings?.coffee_house_name) {
      document.title = `${settings.coffee_house_name} | Digital Menu`;
    }
  }, [settings?.coffee_house_name]);

  const updateSettings = async (payload) => {
    const res = await api.updateSettings(payload);
    if (res.settings) {
      setSettings(prev => ({ ...prev, ...res.settings }));
    }
    return res;
  };

  // Group drinks & foods specifically for clear sections
  const drinksProducts = useMemo(() => {
    return products.filter(item => {
      const slug = (item.category_slug || '').toLowerCase();
      const name = (item.category_name || '').toLowerCase();
      return slug.includes('drink') || slug.includes('coffee') || slug.includes('tea') || name.includes('drink');
    });
  }, [products]);

  const foodProducts = useMemo(() => {
    return products.filter(item => {
      const slug = (item.category_slug || '').toLowerCase();
      const name = (item.category_name || '').toLowerCase();
      return !slug.includes('drink') && !slug.includes('coffee') && !slug.includes('tea') && !name.includes('drink');
    });
  }, [products]);

  // Compute filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      // Category filter
      if (activeCategory !== 'all') {
        if (typeof activeCategory === 'number' && item.category_id !== activeCategory) {
          return false;
        }
        if (typeof activeCategory === 'string' && item.category_slug !== activeCategory) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }

      // Filter Pill
      if (selectedFilter === 'drinks' && !drinksProducts.includes(item)) return false;
      if (selectedFilter === 'foods' && !foodProducts.includes(item)) return false;
      if (selectedFilter === 'available' && !item.is_available) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_etb - b.price_etb;
      if (sortBy === 'price-desc') return b.price_etb - a.price_etb;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, activeCategory, searchQuery, selectedFilter, sortBy, drinksProducts, foodProducts]);

  return (
    <MenuContext.Provider
      value={{
        categories,
        products,
        drinksProducts,
        foodProducts,
        filteredProducts,
        stats,
        settings,
        updateSettings,
        loading,
        activeCategory,
        setActiveCategory,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        isMobileQrOpen,
        setIsMobileQrOpen,
        searchQuery,
        setSearchQuery,
        selectedFilter,
        setSelectedFilter,
        sortBy,
        setSortBy,
        selectedProduct,
        setSelectedProduct,
        removeProduct,
        upsertProduct,
        refreshData: loadAllData
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
}
