import { CelestialObject, DeviceOrientation, Constellation, Planet, Star } from '../types/celestial';
import { AppSettings } from '../types/app';

export class SkyCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: AppSettings;
  private objects: CelestialObject[] = [];
  private currentOrientation: DeviceOrientation | null = null;
  private viewAzimuth = 0; // Current view direction in degrees
  private viewAltitude = 45; // Current view altitude in degrees
  private fieldOfView = 90; // Field of view in degrees
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private objectSelectCallback: ((objectId: string) => void) | null = null;

  constructor(canvasId: string, settings: AppSettings) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id ${canvasId} not found`);
    }
    
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    
    this.ctx = ctx;
    this.settings = settings;
    
    this.setupCanvas();
    this.setupEventListeners();
  }

  async init(): Promise<void> {
    this.resizeCanvas();
    this.render();
  }

  private setupCanvas(): void {
    // Set canvas size
    this.resizeCanvas();
    
    // Setup high DPI support
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  private setupEventListeners(): void {
    // Mouse events for manual navigation
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Resize handler
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  private handleMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.canvas.style.cursor = 'grabbing';
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;
    
    // Update view direction based on mouse movement
    this.viewAzimuth -= deltaX * 0.5;
    this.viewAltitude = Math.max(-90, Math.min(90, this.viewAltitude + deltaY * 0.5));
    
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    
    this.render();
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.canvas.style.cursor = 'crosshair';
  }

  private handleClick(event: MouseEvent): void {
    if (this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedObject = this.getObjectAtPosition(x, y);
    if (clickedObject && this.objectSelectCallback) {
      this.objectSelectCallback(clickedObject.id);
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.isDragging = true;
      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;
    }
    event.preventDefault();
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.lastMouseX;
    const deltaY = touch.clientY - this.lastMouseY;
    
    this.viewAzimuth -= deltaX * 0.5;
    this.viewAltitude = Math.max(-90, Math.min(90, this.viewAltitude + deltaY * 0.5));
    
    this.lastMouseX = touch.clientX;
    this.lastMouseY = touch.clientY;
    
    this.render();
    event.preventDefault();
  }

  private handleTouchEnd(): void {
    this.isDragging = false;
  }

  updateObjects(objects: CelestialObject[]): void {
    this.objects = objects;
    this.render();
  }

  updateOrientation(orientation: DeviceOrientation): void {
    this.currentOrientation = orientation;
    
    if (this.settings.enableGyroscope) {
      // Update view based on device orientation
      this.viewAzimuth = orientation.alpha;
      this.viewAltitude = Math.max(-90, Math.min(90, -orientation.beta));
      this.render();
    }
  }

  centerOnOrientation(orientation: DeviceOrientation): void {
    this.viewAzimuth = orientation.alpha;
    this.viewAltitude = Math.max(-90, Math.min(90, -orientation.beta));
    this.render();
  }

  onObjectSelect(callback: (objectId: string) => void): void {
    this.objectSelectCallback = callback;
  }

  render(): void {
    // Clear canvas
    this.ctx.fillStyle = this.getBackgroundGradient();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars background
    this.drawStarField();
    
    // Draw celestial objects
    this.objects.forEach(object => {
      this.drawCelestialObject(object);
    });
    
    // Draw compass and info
    this.drawCompass();
    this.drawInfo();
  }

  private getBackgroundGradient(): CanvasGradient {
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
    );
    
    // Night sky gradient
    gradient.addColorStop(0, '#1a1a3a');
    gradient.addColorStop(0.7, '#0f0f23');
    gradient.addColorStop(1, '#000014');
    
    return gradient;
  }

  private drawStarField(): void {
    // Draw random background stars for atmosphere
    this.ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.8 + 0.2;
      
      this.ctx.globalAlpha = opacity;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, 2 * Math.PI);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }

  private drawCelestialObject(object: CelestialObject): void {
    // Calculate screen position based on object coordinates and current view
    const screenPos = this.celestialToScreen(object.coordinates.rightAscension, object.coordinates.declination);
    
    if (!screenPos) return; // Object not in view
    
    switch (object.type) {
      case 'constellation':
        this.drawConstellation(object as Constellation, screenPos);
        break;
      case 'planet':
        this.drawPlanet(object as Planet, screenPos);
        break;
      case 'star':
        this.drawStar(object as any, screenPos);
        break;
      default:
        this.drawGenericObject(object, screenPos);
        break;
    }
  }

  private drawConstellation(constellation: Constellation, centerPos: { x: number; y: number }): void {
    if (!this.settings.showConstellationLines && !this.settings.showConstellationNames) return;
    
    // Draw constellation lines
    if (this.settings.showConstellationLines && constellation.lines) {
      this.ctx.strokeStyle = '#4fc3f7';
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.6;
      
      constellation.lines.forEach(line => {
        const fromStar = constellation.stars.find(s => s.id === line.from);
        const toStar = constellation.stars.find(s => s.id === line.to);
        
        if (fromStar && toStar) {
          const fromPos = this.celestialToScreen(fromStar.coordinates.rightAscension, fromStar.coordinates.declination);
          const toPos = this.celestialToScreen(toStar.coordinates.rightAscension, toStar.coordinates.declination);
          
          if (fromPos && toPos) {
            this.ctx.beginPath();
            this.ctx.moveTo(fromPos.x, fromPos.y);
            this.ctx.lineTo(toPos.x, toPos.y);
            this.ctx.stroke();
          }
        }
      });
      
      this.ctx.globalAlpha = 1;
    }
    
    // Draw stars
    constellation.stars.forEach(star => {
      const starPos = this.celestialToScreen(star.coordinates.rightAscension, star.coordinates.declination);
      if (starPos) {
        this.drawStar(star, starPos);
      }
    });
    
    // Draw constellation name
    if (this.settings.showConstellationNames) {
      this.ctx.fillStyle = '#64ffda';
      this.ctx.font = '14px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(constellation.name, centerPos.x, centerPos.y - 20);
    }
  }

  private drawPlanet(planet: Planet, pos: { x: number; y: number }): void {
    // Draw planet as a colored circle
    const size = Math.max(4, 8 - (planet.magnitude || 0));
    
    this.ctx.fillStyle = this.getPlanetColor(planet.id);
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw planet label
    if (this.settings.showPlanetLabels) {
      this.ctx.fillStyle = '#ff6b35';
      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(planet.name, pos.x, pos.y - size - 5);
    }
  }

  private drawStar(star: Star, pos: { x: number; y: number }): void {
    const size = Math.max(1, 5 - star.magnitude);
    
    this.ctx.fillStyle = star.color || '#ffffff';
    this.ctx.globalAlpha = Math.max(0.3, 1 - star.magnitude / 6);
    
    // Draw star with twinkle effect
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Add star spikes for brighter stars
    if (star.magnitude < 2) {
      this.ctx.strokeStyle = star.color || '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x - size * 2, pos.y);
      this.ctx.lineTo(pos.x + size * 2, pos.y);
      this.ctx.moveTo(pos.x, pos.y - size * 2);
      this.ctx.lineTo(pos.x, pos.y + size * 2);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1;
  }

  private drawGenericObject(object: CelestialObject, pos: { x: number; y: number }): void {
    this.ctx.fillStyle = '#64ffda';
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw object name
    this.ctx.fillStyle = '#b8c5d6';
    this.ctx.font = '10px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(object.name, pos.x, pos.y - 8);
  }

  private drawCompass(): void {
    const compassX = 60;
    const compassY = 60;
    const compassRadius = 40;
    
    // Draw compass background
    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(compassX, compassY, compassRadius + 5, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw compass border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(compassX, compassY, compassRadius, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Draw north arrow
    const northAngle = -this.viewAzimuth * Math.PI / 180;
    const arrowX = compassX + Math.sin(northAngle) * (compassRadius - 10);
    const arrowY = compassY - Math.cos(northAngle) * (compassRadius - 10);
    
    this.ctx.fillStyle = '#ff6b35';
    this.ctx.beginPath();
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(arrowX - 5, arrowY + 15);
    this.ctx.lineTo(arrowX + 5, arrowY + 15);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw N marker
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', compassX, compassY - compassRadius - 10);
  }

  private drawInfo(): void {
    const infoX = this.canvas.width - 20;
    const infoY = 30;
    
    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    this.ctx.fillRect(infoX - 200, infoY - 15, 190, 70);
    
    this.ctx.fillStyle = '#b8c5d6';
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.textAlign = 'right';
    
    this.ctx.fillText(`Azimuth: ${Math.round(this.viewAzimuth)}°`, infoX - 10, infoY);
    this.ctx.fillText(`Altitude: ${Math.round(this.viewAltitude)}°`, infoX - 10, infoY + 20);
    
    // Show orientation status if available
    if (this.currentOrientation) {
      this.ctx.fillText(`Gyro: ON`, infoX - 10, infoY + 40);
    } else {
      this.ctx.fillText(`Gyro: OFF`, infoX - 10, infoY + 40);
    }
  }

  private celestialToScreen(ra: number, dec: number): { x: number; y: number } | null {
    // Convert celestial coordinates to screen coordinates
    // This is a simplified projection - in a real app, you'd use proper astronomical calculations
    
    // Convert RA/Dec to azimuth/altitude based on current view
    // RA is in hours (0-24), convert to degrees
    const objectAzimuth = (ra * 15) % 360; // RA in degrees
    const objectAltitude = dec;
    
    // Calculate relative position from current view center
    let azimuthDiff = objectAzimuth - this.viewAzimuth;
    
    // Handle wraparound at 0/360 degrees
    if (azimuthDiff > 180) azimuthDiff -= 360;
    if (azimuthDiff < -180) azimuthDiff += 360;
    
    const altitudeDiff = objectAltitude - this.viewAltitude;
    
    // Check if object is in current field of view (be more inclusive)
    const halfFOV = this.fieldOfView / 2;
    if (Math.abs(azimuthDiff) > halfFOV || Math.abs(altitudeDiff) > halfFOV) {
      return null; // Object not in view
    }
    
    // Project to screen coordinates
    const x = this.canvas.width / 2 + azimuthDiff * (this.canvas.width / this.fieldOfView);
    const y = this.canvas.height / 2 - altitudeDiff * (this.canvas.height / this.fieldOfView);
    
    // Ensure coordinates are within canvas bounds
    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
      return null;
    }
    
    return { x, y };
  }

  private getPlanetColor(planetId: string): string {
    const colors: { [key: string]: string } = {
      mercury: '#8c7853',
      venus: '#ffc649',
      mars: '#cd5c5c',
      jupiter: '#d8ca9d',
      saturn: '#fab27b'
    };
    
    return colors[planetId] || '#ffffff';
  }

  private getObjectAtPosition(x: number, y: number): CelestialObject | null {
    const tolerance = 20; // Click tolerance in pixels
    
    for (const object of this.objects) {
      const screenPos = this.celestialToScreen(object.coordinates.rightAscension, object.coordinates.declination);
      if (screenPos) {
        const distance = Math.sqrt(Math.pow(x - screenPos.x, 2) + Math.pow(y - screenPos.y, 2));
        if (distance <= tolerance) {
          return object;
        }
      }
    }
    
    return null;
  }
}