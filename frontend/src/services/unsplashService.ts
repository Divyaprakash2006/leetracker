// Unsplash API implementation with access key
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'hxagClR6tPhRvVkozx5-3UG7joZ6q5yK47asYS_mYhY';

// Fetch random photos from Unsplash API with specific query and timeout
export const fetchUnsplashPhotos = async (query: string, count: number = 8): Promise<string[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for faster fallback
    
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=${count}&orientation=landscape&content_filter=high`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const photos = await response.json();
    // Optimized: Smaller size with better compression for faster loading
    return photos.map((photo: any) => `${photo.urls.raw}&w=1600&h=900&fit=crop&q=85&fm=webp&auto=format,compress`);
  } catch (error) {
    console.error('Error fetching Unsplash photos:', error);
    // Fallback to curated images if API fails
    return getCuratedBackgroundUrls();
  }
};

// Get curated background URLs - optimized for instant loading
export const getCuratedBackgroundUrls = (): string[] => {
  const imageIds = [
    'XJXWbfSo2f0', // Bright colorful desk with plants
    'L8tWZT4CcVQ', // Modern organized workspace
    'bELvIg_KZGU', // Clean minimal desk
    'Skf7HxARcoc', // Bright study area
    'hpjSkU2UYSU', // Colorful office desk
    'gyRa86ExKTw', // Natural light workspace
    'IuLgi9PWETU', // Creative desk setup
    'GnvurwJsKaY', // Modern study room
    'Im7lZjxeLhg', // Laptop on desk
    '4Mw7nkQDByk', // Modern office
    'Wpnoqo2plFA', // Clean workspace
    '505eectW54k', // Developer desk
    'jrh5lAq-mIs', // Coding setup
    'wD1LRb9OeEo', // Study desk
    'bwki71ap-y8', // Tech workspace
    'ute2XAFQU2I'  // Creative desk
  ];
  
  // Optimized: Smaller size, WebP format, aggressive caching for instant loading
  return imageIds.map(id => 
    `https://images.unsplash.com/photo-${id}?w=1400&h=800&fit=crop&q=80&fm=webp&auto=format,compress&cache=max`
  );
};

// Get educational workspace backgrounds (uses API for variety)
export const getEducationalBackgrounds = async (): Promise<string[]> => {
  const queries = [
    'programming workspace coding desk',
    'computer science study desk',
    'software development workspace',
    'coding bootcamp classroom',
    'technology education workspace',
    'developer desk setup laptop',
    'learning programming study',
    'tech workspace computer desk'
  ];
  
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  return await fetchUnsplashPhotos(randomQuery, 8);
};
