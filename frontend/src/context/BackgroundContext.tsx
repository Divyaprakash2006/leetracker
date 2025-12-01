import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEducationalBackgrounds, getCuratedBackgroundUrls } from '../services/unsplashService';

interface BackgroundContextType {
  currentBgIndex: number;
  backgroundImages: string[];
  imagesLoaded: boolean;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [backgroundImages, setBackgroundImages] = useState<string[]>(getCuratedBackgroundUrls());
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load and preload backgrounds once on app startup
  useEffect(() => {
    const loadBackgrounds = async () => {
      // Show curated images immediately (no preloading delay)
      const curatedImages = getCuratedBackgroundUrls();
      setBackgroundImages(curatedImages);
      setImagesLoaded(true); // Enable transitions immediately
      
      // Preload first 3 images only for instant display
      const quickPreload = curatedImages.slice(0, 3).map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        });
      });
      
      await Promise.all(quickPreload);
      
      // Fetch fresh images from Unsplash API in background (non-blocking)
      getEducationalBackgrounds().then((images) => {
        // Only update if we got valid images
        if (images && images.length > 0) {
          // Lazy preload API images in background
          images.forEach((src) => {
            const img = new Image();
            img.src = src;
          });
          
          // Switch to API images after brief delay
          setTimeout(() => {
            setBackgroundImages(images);
          }, 1000);
        }
      }).catch(() => {
        console.log('Using curated images (API unavailable)');
      });
    };
    
    loadBackgrounds();
  }, []);

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
