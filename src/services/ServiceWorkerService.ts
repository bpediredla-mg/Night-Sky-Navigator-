import { Workbox } from 'workbox-window';

export class ServiceWorkerService {
  private wb: Workbox | null = null;
  private isUpdateAvailable = false;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.wb = new Workbox('/sw.js');
        
        // Add event listeners
        this.wb.addEventListener('waiting', () => {
          this.isUpdateAvailable = true;
          this.showUpdatePrompt();
        });

        this.wb.addEventListener('controlling', () => {
          window.location.reload();
        });

        // Register the service worker
        await this.wb.register();
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private showUpdatePrompt(): void {
    // Create a subtle update notification
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>🚀 A new version is available!</span>
        <button class="update-button" onclick="this.parentElement.parentElement.handleUpdate()">Update</button>
        <button class="dismiss-button" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add update handler to the banner element
    (updateBanner as any).handleUpdate = () => {
      this.applyUpdate();
      updateBanner.remove();
    };

    // Style the banner
    updateBanner.style.cssText = `
      position: fixed;
      top: 70px;
      right: 1rem;
      background: linear-gradient(135deg, #64ffda 0%, #29b6f6 100%);
      color: #000014;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(100, 255, 218, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;

    // Add styles for the content
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .update-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
      }
      .update-button {
        background: rgba(0, 0, 20, 0.1);
        border: 1px solid rgba(0, 0, 20, 0.2);
        color: inherit;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .update-button:hover {
        background: rgba(0, 0, 20, 0.2);
      }
      .dismiss-button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem;
        line-height: 1;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(updateBanner);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (updateBanner.parentElement) {
        updateBanner.remove();
      }
    }, 10000);
  }

  private applyUpdate(): void {
    if (this.wb && this.isUpdateAvailable) {
      this.wb.messageSkipWaiting();
    }
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
        
        // Show success message
        this.showMessage('Cache cleared successfully!', 'success');
      } catch (error) {
        console.error('Failed to clear caches:', error);
        this.showMessage('Failed to clear cache', 'error');
      }
    }
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

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
      style.remove();
    }, 3000);
  }

  async getCacheInfo(): Promise<{ size: number; version: string; lastUpdated: Date }> {
    let totalSize = 0;
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
    }

    return {
      size: totalSize,
      version: '1.0.0', // This would normally come from your app version
      lastUpdated: new Date()
    };
  }
}