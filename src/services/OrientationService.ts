import { DeviceOrientation } from '../types/celestial';
import { PermissionState } from '../types/app';

export class OrientationService {
  private currentOrientation: DeviceOrientation | null = null;
  private isListening = false;
  private orientationCallbacks: ((orientation: DeviceOrientation) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private lastUpdateTime = 0;
  private readonly UPDATE_THROTTLE = 50; // Throttle updates to 20fps

  async requestPermission(): Promise<PermissionState> {
    // Check if DeviceOrientationEvent exists
    if (!window.DeviceOrientationEvent) {
      return PermissionState.DENIED;
    }

    // For iOS 13+ devices, we need to request permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted' ? PermissionState.GRANTED : PermissionState.DENIED;
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        return PermissionState.DENIED;
      }
    }

    // For other devices, assume permission is granted if the API exists
    return PermissionState.GRANTED;
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== PermissionState.GRANTED) {
      throw new Error('Device orientation permission denied');
    }

    this.isListening = true;

    // Listen for device orientation events
    window.addEventListener('deviceorientation', this.handleOrientationEvent.bind(this), true);
    
    // Also listen for absolute orientation if available
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', this.handleAbsoluteOrientationEvent.bind(this), true);
    }

    console.log('Started listening for device orientation');
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
    window.removeEventListener('deviceorientation', this.handleOrientationEvent.bind(this), true);
    
    if ('ondeviceorientationabsolute' in window) {
      window.removeEventListener('deviceorientationabsolute', this.handleAbsoluteOrientationEvent.bind(this), true);
    }

    console.log('Stopped listening for device orientation');
  }

  private handleOrientationEvent(event: DeviceOrientationEvent): void {
    this.processOrientationData(event, false);
  }

  private handleAbsoluteOrientationEvent(event: DeviceOrientationEvent): void {
    this.processOrientationData(event, true);
  }

  private processOrientationData(event: DeviceOrientationEvent, absolute: boolean): void {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.UPDATE_THROTTLE) {
      return; // Throttle updates
    }
    this.lastUpdateTime = now;

    // Handle null values
    const alpha = event.alpha ?? 0;
    const beta = event.beta ?? 0;
    const gamma = event.gamma ?? 0;

    const orientation: DeviceOrientation = {
      alpha: this.normalizeAngle(alpha),
      beta: this.clampAngle(beta, -180, 180),
      gamma: this.clampAngle(gamma, -90, 90),
      absolute
    };

    this.currentOrientation = orientation;
    this.notifyOrientationCallbacks(orientation);
  }

  private normalizeAngle(angle: number): number {
    // Normalize to 0-360 degrees
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }

  private clampAngle(angle: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, angle));
  }

  onOrientationUpdate(callback: (orientation: DeviceOrientation) => void): void {
    this.orientationCallbacks.push(callback);
  }

  onOrientationError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  removeOrientationCallback(callback: (orientation: DeviceOrientation) => void): void {
    const index = this.orientationCallbacks.indexOf(callback);
    if (index > -1) {
      this.orientationCallbacks.splice(index, 1);
    }
  }

  removeErrorCallback(callback: (error: string) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  getCurrentOrientation(): DeviceOrientation | null {
    return this.currentOrientation;
  }

  private notifyOrientationCallbacks(orientation: DeviceOrientation): void {
    this.orientationCallbacks.forEach(callback => {
      try {
        callback(orientation);
      } catch (error) {
        console.error('Error in orientation callback:', error);
        // Optionally notify error callbacks
        this.notifyErrorCallbacks(`Callback error: ${error}`);
      }
    });
  }

  private notifyErrorCallbacks(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  // Utility methods for orientation calculations
  static getCompassHeading(orientation: DeviceOrientation): number {
    // Convert device orientation to compass heading
    // This depends on device orientation and may need calibration
    return orientation.absolute ? orientation.alpha : (orientation.alpha + 360) % 360;
  }

  static getTiltFromHorizontal(orientation: DeviceOrientation): number {
    // Calculate tilt from horizontal plane
    return Math.sqrt(orientation.beta * orientation.beta + orientation.gamma * orientation.gamma);
  }

  static isDeviceLevel(orientation: DeviceOrientation, threshold = 10): boolean {
    // Check if device is approximately level
    const tilt = this.getTiltFromHorizontal(orientation);
    return tilt < threshold;
  }

  static getScreenOrientation(): number {
    // Get screen orientation in degrees
    if (screen.orientation) {
      return screen.orientation.angle;
    }
    
    // Fallback for older browsers
    return window.orientation ? Number(window.orientation) : 0;
  }

  // Calculate azimuth correction based on device orientation
  static calculateAzimuthCorrection(): number {
    const screenOrientation = this.getScreenOrientation();
    
    // Adjust compass heading based on screen orientation
    let correction = 0;
    switch (screenOrientation) {
      case 90: // Landscape left
        correction = -90;
        break;
      case -90: // Landscape right
      case 270:
        correction = 90;
        break;
      case 180: // Portrait upside down
        correction = 180;
        break;
      default: // Portrait
        correction = 0;
        break;
    }
    
    return correction;
  }

  // Check if device supports orientation
  static isSupported(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  // Check if device supports absolute orientation
  static supportsAbsoluteOrientation(): boolean {
    return 'ondeviceorientationabsolute' in window;
  }
}