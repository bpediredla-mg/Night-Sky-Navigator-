import { FavoriteObject } from '../types/app';

export class FavoritesService {
  private static readonly STORAGE_KEY = 'skyNavigatorFavorites';
  private favorites: Map<string, FavoriteObject> = new Map();

  async loadFavorites(): Promise<void> {
    try {
      const saved = localStorage.getItem(FavoritesService.STORAGE_KEY);
      if (saved) {
        const favoritesArray: FavoriteObject[] = JSON.parse(saved);
        this.favorites.clear();
        
        favoritesArray.forEach(favorite => {
          // Convert date string back to Date object
          favorite.addedAt = new Date(favorite.addedAt);
          this.favorites.set(favorite.objectId, favorite);
        });
        
        console.log(`Loaded ${this.favorites.size} favorites`);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.favorites.clear();
    }
  }

  addFavorite(objectId: string, notes?: string): void {
    const favorite: FavoriteObject = {
      objectId,
      addedAt: new Date(),
      notes
    };
    
    this.favorites.set(objectId, favorite);
    this.saveFavorites();
    
    console.log(`Added ${objectId} to favorites`);
  }

  removeFavorite(objectId: string): void {
    const wasRemoved = this.favorites.delete(objectId);
    if (wasRemoved) {
      this.saveFavorites();
      console.log(`Removed ${objectId} from favorites`);
    }
  }

  isFavorited(objectId: string): boolean {
    return this.favorites.has(objectId);
  }

  getFavorite(objectId: string): FavoriteObject | undefined {
    return this.favorites.get(objectId);
  }

  getAllFavorites(): FavoriteObject[] {
    return Array.from(this.favorites.values()).sort((a, b) => 
      b.addedAt.getTime() - a.addedAt.getTime()
    );
  }

  getFavoriteIds(): string[] {
    return Array.from(this.favorites.keys());
  }

  updateFavoriteNotes(objectId: string, notes: string): void {
    const favorite = this.favorites.get(objectId);
    if (favorite) {
      favorite.notes = notes;
      this.saveFavorites();
    }
  }

  clearAllFavorites(): void {
    this.favorites.clear();
    this.saveFavorites();
    console.log('Cleared all favorites');
  }

  getRecentFavorites(limit = 5): FavoriteObject[] {
    return this.getAllFavorites().slice(0, limit);
  }

  getFavoritesCount(): number {
    return this.favorites.size;
  }

  exportFavorites(): string {
    const favoritesArray = this.getAllFavorites();
    return JSON.stringify(favoritesArray, null, 2);
  }

  async importFavorites(jsonData: string): Promise<number> {
    try {
      const importedFavorites: FavoriteObject[] = JSON.parse(jsonData);
      let importCount = 0;
      
      for (const favorite of importedFavorites) {
        if (this.isValidFavorite(favorite)) {
          // Convert date string to Date object if needed
          if (typeof favorite.addedAt === 'string') {
            favorite.addedAt = new Date(favorite.addedAt);
          }
          
          this.favorites.set(favorite.objectId, favorite);
          importCount++;
        }
      }
      
      this.saveFavorites();
      console.log(`Imported ${importCount} favorites`);
      return importCount;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      throw new Error('Invalid favorites data format');
    }
  }

  private saveFavorites(): void {
    try {
      const favoritesArray = Array.from(this.favorites.values());
      localStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Failed to save favorites:', error);
      
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        this.handleStorageQuotaExceeded();
      }
    }
  }

  private handleStorageQuotaExceeded(): void {
    console.warn('Local storage quota exceeded, removing oldest favorites');
    
    // Remove oldest favorites until we can save
    const sortedFavorites = this.getAllFavorites();
    const keepCount = Math.floor(sortedFavorites.length * 0.8); // Keep 80%
    
    this.favorites.clear();
    sortedFavorites.slice(0, keepCount).forEach(favorite => {
      this.favorites.set(favorite.objectId, favorite);
    });
    
    // Try to save again
    try {
      const favoritesArray = Array.from(this.favorites.values());
      localStorage.setItem(FavoritesService.STORAGE_KEY, JSON.stringify(favoritesArray));
      console.log(`Reduced favorites to ${this.favorites.size} items`);
    } catch (retryError) {
      console.error('Still unable to save favorites after cleanup:', retryError);
    }
  }

  private isValidFavorite(favorite: any): boolean {
    return favorite &&
           typeof favorite.objectId === 'string' &&
           favorite.objectId.length > 0 &&
           (favorite.addedAt instanceof Date || typeof favorite.addedAt === 'string') &&
           (favorite.notes === undefined || typeof favorite.notes === 'string');
  }

  // Get favorites statistics
  getStatistics(): {
    totalCount: number;
    oldestFavorite: Date | null;
    newestFavorite: Date | null;
    averageAge: number; // in days
  } {
    const favorites = this.getAllFavorites();
    
    if (favorites.length === 0) {
      return {
        totalCount: 0,
        oldestFavorite: null,
        newestFavorite: null,
        averageAge: 0
      };
    }
    
    const now = new Date();
    const dates = favorites.map(f => f.addedAt);
    const oldestFavorite = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestFavorite = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const totalAge = favorites.reduce((sum, favorite) => {
      const ageInMs = now.getTime() - favorite.addedAt.getTime();
      return sum + (ageInMs / (1000 * 60 * 60 * 24)); // Convert to days
    }, 0);
    
    const averageAge = totalAge / favorites.length;
    
    return {
      totalCount: favorites.length,
      oldestFavorite,
      newestFavorite,
      averageAge
    };
  }

  // Search favorites by name or notes
  searchFavorites(query: string): string[] {
    const lowercaseQuery = query.toLowerCase();
    const results: string[] = [];
    
    for (const [objectId, favorite] of this.favorites) {
      if (objectId.toLowerCase().includes(lowercaseQuery) ||
          (favorite.notes && favorite.notes.toLowerCase().includes(lowercaseQuery))) {
        results.push(objectId);
      }
    }
    
    return results;
  }
}