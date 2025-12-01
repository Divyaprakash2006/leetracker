import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCuratedBackgroundUrls, getEducationalBackgrounds } from '../services/unsplashService';

interface BackgroundContextType {
  currentBgIndex: number;
  backgroundImages: string[];
  imagesLoaded: boolean;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load backgrounds instantly - no API delays
  useEffect(() => {
    let cancelled = false;

    const loadBackgrounds = async () => {
      const cachedImages = localStorage.getItem('bg_images_cache');
      let images: string[] = [];

      if (cachedImages) {
        try {
          images = JSON.parse(cachedImages);
          console.log('✅ Loaded cached background images');
        } catch (error) {
          console.warn('Cache parse failed, using curated images');
        }
      }

      if (!images || images.length === 0) {
        images = getCuratedBackgroundUrls();
        localStorage.setItem('bg_images_cache', JSON.stringify(images));
      }

      if (!cancelled) {
        setBackgroundImages(images);
        setImagesLoaded(true);
      }

      try {
        const freshImages = await getEducationalBackgrounds();
        if (!cancelled && Array.isArray(freshImages) && freshImages.length > 0) {
          setBackgroundImages(freshImages);
          setCurrentBgIndex(0);
          localStorage.setItem('bg_images_cache', JSON.stringify(freshImages));
        }
      } catch (error) {
        console.warn('Unable to refresh Unsplash backgrounds:', error);
      }
    };

    loadBackgrounds();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!imagesLoaded || backgroundImages.length === 0) {
      return;
    }

    backgroundImages.slice(0, 5).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [backgroundImages, imagesLoaded]);

  // Auto-change background every 10 seconds
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [backgroundImages.length, imagesLoaded]);

  // Preload next image
  useEffect(() => {
    if (!imagesLoaded) return;
    const nextIndex = (currentBgIndex + 1) % backgroundImages.length;
    const img = new Image();
    img.src = backgroundImages[nextIndex];
  }, [currentBgIndex, backgroundImages, imagesLoaded]);

  return (
    <BackgroundContext.Provider value={{ currentBgIndex, backgroundImages, imagesLoaded }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
