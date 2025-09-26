import { CelestialObject, UserLocation, DeviceOrientation } from '../types/celestial';
import { NavigationState, ViewType, AppSettings, Theme } from '../types/app';
import { LocationService } from '../services/LocationService';
import { OrientationService } from '../services/OrientationService';
import { SkyCanvas } from './SkyCanvas';
import { ObjectPanel } from './ObjectPanel';
import { FavoritesService } from '../services/FavoritesService';
import { constellations } from '../data/constellations';
import { planets } from '../data/planets';

export class SkyNavigator {
  private locationService: LocationService;
  private orientationService: OrientationService;
  private favoritesService: FavoritesService;
  private skyCanvas: SkyCanvas | null = null;
  private objectPanel: ObjectPanel | null = null;
  
  private currentLocation: UserLocation | null = null;
  private currentOrientation: DeviceOrientation | null = null;
  private navigationState: NavigationState;
  private appSettings: AppSettings;
  private celestialObjects: CelestialObject[] = [];

  constructor() {
    this.locationService = new LocationService();
    this.orientationService = new OrientationService();
    this.favoritesService = new FavoritesService();
    
    this.navigationState = {
      currentView: ViewType.SKY_MAP,
      filters: {
        type: ['constellation', 'planet'],
        visibility: 'visible-now' as any,
        magnitude: { min: -5, max: 6 }
      }
    };

    this.appSettings = this.loadSettings();
    this.celestialObjects = [...constellations, ...planets];
  }

  async init(): Promise<void> {
    try {
      // Initialize the UI
      this.createUI();
      
      // Load favorites
      await this.favoritesService.loadFavorites();
      
      // Request location permission and start tracking
      await this.setupLocation();
      
      // Setup device orientation if supported and enabled
      if (this.appSettings.enableGyroscope) {
        await this.setupOrientation();
      }
      
      // Initialize sky canvas
      if (this.skyCanvas) {
        await this.skyCanvas.init();
      }
      
      console.log('SkyNavigator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SkyNavigator:', error);
      throw error;
    }
  }

  private createUI(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <a href="#" class="logo">
              <span class="logo-icon">🌌</span>
              <span>SkyNav</span>
            </a>
            <nav class="nav-controls">
              <button class="nav-button active" data-view="sky-map">
                🗺️ Sky Map
              </button>
              <button class="nav-button" data-view="favorites">
                ⭐ Favorites
              </button>
              <button class="nav-button" data-view="settings">
                ⚙️ Settings
              </button>
            </nav>
          </div>
        </header>
        
        <main class="main-content">
          <div class="sky-canvas-container">
            <canvas class="sky-canvas" id="sky-canvas"></canvas>
          </div>
          
          <div class="object-info-panel" id="object-panel">
            <!-- Object details will be inserted here -->
          </div>
          
          <div class="controls-panel">
            <div class="control-group">
              <label class="control-label">Object Types</label>
              <button class="control-button active" data-filter="constellation">
                Constellations
              </button>
              <button class="control-button active" data-filter="planet">
                Planets
              </button>
              <button class="control-button" data-filter="satellite">
                Satellites
              </button>
            </div>
            
            <div class="control-group">
              <label class="control-label">View</label>
              <button class="control-button" id="center-view">
                📍 Center View
              </button>
              <button class="control-button" id="toggle-gyro">
                🧭 ${this.appSettings.enableGyroscope ? 'Gyro ON' : 'Gyro OFF'}
              </button>
            </div>
            
            <div class="control-group">
              <label class="control-label">Cache</label>
              <button class="control-button" id="clear-cache">
                🗑️ Clear Cache
              </button>
            </div>
          </div>
        </main>
      </div>
    `;

    // Initialize components
    this.skyCanvas = new SkyCanvas('sky-canvas', this.appSettings);
    this.objectPanel = new ObjectPanel('object-panel');
    
    // Setup event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const view = target.dataset.view as ViewType;
        if (view) {
          this.switchView(view);
        }
      });
    });

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const filter = target.dataset.filter;
        if (filter) {
          this.toggleFilter(filter);
          target.classList.toggle('active');
        }
      });
    });

    // Control buttons
    const centerViewBtn = document.getElementById('center-view');
    if (centerViewBtn) {
      centerViewBtn.addEventListener('click', () => this.centerView());
    }

    const toggleGyroBtn = document.getElementById('toggle-gyro');
    if (toggleGyroBtn) {
      toggleGyroBtn.addEventListener('click', () => this.toggleGyroscope());
    }

    const clearCacheBtn = document.getElementById('clear-cache');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }

    // Object selection from canvas
    if (this.skyCanvas) {
      this.skyCanvas.onObjectSelect((objectId: string) => {
        this.selectObject(objectId);
      });
    }
  }

  private async setupLocation(): Promise<void> {
    try {
      // Request location permission
      const permission = await this.locationService.requestPermission();
      
      if (permission === 'granted') {
        // Get initial location
        this.currentLocation = await this.locationService.getCurrentLocation();
        
        // Start watching location changes
        this.locationService.startWatching();
        
        // Listen for location updates
        this.locationService.onLocationUpdate((location) => {
          this.currentLocation = location;
          this.updateVisibleObjects();
        });
        
        console.log('Location services initialized');
      } else {
        console.warn('Location permission denied');
        // Use default location (e.g., Greenwich)
        this.currentLocation = {
          coordinates: { lat: 51.4778, lng: -0.0015 },
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Failed to setup location:', error);
      // Fallback to default location
      this.currentLocation = {
        coordinates: { lat: 51.4778, lng: -0.0015 },
        timestamp: new Date()
      };
    }
  }

  private async setupOrientation(): Promise<void> {
    try {
      await this.orientationService.startListening();
      
      this.orientationService.onOrientationUpdate((orientation) => {
        this.currentOrientation = orientation;
        if (this.skyCanvas && this.appSettings.enableGyroscope) {
          this.skyCanvas.updateOrientation(orientation);
        }
      });
      
      console.log('Orientation services initialized');
    } catch (error) {
      console.error('Failed to setup orientation:', error);
      this.appSettings.enableGyroscope = false;
      this.saveSettings();
    }
  }

  private switchView(view: ViewType): void {
    // Update navigation state
    this.navigationState.currentView = view;
    
    // Update active nav button
    document.querySelectorAll('.nav-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    // Handle view-specific logic
    switch (view) {
      case ViewType.SKY_MAP:
        this.showSkyMap();
        break;
      case ViewType.FAVORITES:
        this.showFavorites();
        break;
      case ViewType.SETTINGS:
        this.showSettings();
        break;
    }
  }

  private showSkyMap(): void {
    const canvas = document.querySelector('.sky-canvas-container') as HTMLElement;
    const controls = document.querySelector('.controls-panel') as HTMLElement;
    
    if (canvas) canvas.style.display = 'block';
    if (controls) controls.style.display = 'block';
    
    if (this.skyCanvas) {
      this.skyCanvas.render();
    }
  }

  private showFavorites(): void {
    // Implementation for favorites view
    console.log('Showing favorites view');
  }

  private showSettings(): void {
    // Implementation for settings view
    console.log('Showing settings view');
  }

  private toggleFilter(filterType: string): void {
    const index = this.navigationState.filters.type.indexOf(filterType);
    if (index > -1) {
      this.navigationState.filters.type.splice(index, 1);
    } else {
      this.navigationState.filters.type.push(filterType);
    }
    
    this.updateVisibleObjects();
  }

  private selectObject(objectId: string): void {
    const object = this.celestialObjects.find(obj => obj.id === objectId);
    if (object && this.objectPanel) {
      this.objectPanel.showObject(object);
    }
  }

  private centerView(): void {
    if (this.skyCanvas && this.currentOrientation) {
      this.skyCanvas.centerOnOrientation(this.currentOrientation);
    }
  }

  private async toggleGyroscope(): Promise<void> {
    this.appSettings.enableGyroscope = !this.appSettings.enableGyroscope;
    
    const toggleBtn = document.getElementById('toggle-gyro');
    if (toggleBtn) {
      toggleBtn.textContent = `🧭 ${this.appSettings.enableGyroscope ? 'Gyro ON' : 'Gyro OFF'}`;
    }
    
    if (this.appSettings.enableGyroscope) {
      await this.setupOrientation();
    } else {
      this.orientationService.stopListening();
    }
    
    this.saveSettings();
  }

  private async clearCache(): Promise<void> {
    try {
      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ action: 'clearCache' });
        }
      }
      
      // Clear application caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear local storage (but preserve settings and favorites)
      const settings = localStorage.getItem('skyNavigatorSettings');
      const favorites = localStorage.getItem('skyNavigatorFavorites');
      localStorage.clear();
      if (settings) localStorage.setItem('skyNavigatorSettings', settings);
      if (favorites) localStorage.setItem('skyNavigatorFavorites', favorites);
      
      this.showMessage('Cache cleared successfully!', 'success');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      this.showMessage('Failed to clear cache', 'error');
    }
  }

  private updateVisibleObjects(): void {
    // Filter objects based on current filters and location
    const filteredObjects = this.celestialObjects.filter(obj => {
      return this.navigationState.filters.type.includes(obj.type);
    });
    
    if (this.skyCanvas) {
      this.skyCanvas.updateObjects(filteredObjects);
    }
    
    // Use current location for future enhancements
    if (this.currentLocation) {
      console.log(`Updated objects for location: ${this.currentLocation.coordinates.lat}, ${this.currentLocation.coordinates.lng}`);
    }
  }

  private loadSettings(): AppSettings {
    const saved = localStorage.getItem('skyNavigatorSettings');
    if (saved) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    return this.getDefaultSettings();
  }

  private saveSettings(): void {
    localStorage.setItem('skyNavigatorSettings', JSON.stringify(this.appSettings));
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: Theme.DARK,
      showConstellationLines: true,
      showConstellationNames: true,
      showPlanetLabels: true,
      enableGyroscope: true,
      locationPermission: false,
      notifications: false,
      magnitude_limit: 6
    };
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#4caf50' : '#ff5252'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      font-weight: 600;
      animation: fadeInOut 3s ease;
    `;

    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  }
}