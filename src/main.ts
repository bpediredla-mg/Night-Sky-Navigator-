import './styles/main.css';
import { SkyNavigator } from './components/SkyNavigator';
import { ServiceWorkerService } from './services/ServiceWorkerService';

class App {
  private skyNavigator: SkyNavigator;
  private serviceWorkerService: ServiceWorkerService;

  constructor() {
    this.skyNavigator = new SkyNavigator();
    this.serviceWorkerService = new ServiceWorkerService();
  }

  async init(): Promise<void> {
    try {
      // Initialize service worker for PWA functionality
      await this.serviceWorkerService.register();
      
      // Initialize the main sky navigator component
      await this.skyNavigator.init();
      
      // Hide loading screen
      this.hideLoadingScreen();
      
      console.log('Night Sky Navigator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize the application. Please refresh and try again.');
    }
  }

  private hideLoadingScreen(): void {
    const loadingScreen = document.querySelector('.loading-screen') as HTMLElement;
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  private showError(message: string): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="error-screen">
          <div class="error-content">
            <h1>🌌 Oops!</h1>
            <p>${this.sanitizeHtml(message)}</p>
            <button onclick="location.reload()" class="retry-button">Try Again</button>
          </div>
        </div>
      `;
    }
  }

  private sanitizeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

// Handle app installation prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
  e.preventDefault();
  // Could show install button here in the future
  console.log('PWA install prompt available', deferredPrompt);
});

// Export for potential use in other modules
export { App };