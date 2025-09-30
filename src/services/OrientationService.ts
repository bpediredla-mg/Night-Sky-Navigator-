import { DeviceOrientation } from '../types/celestial';
import { PermissionState } from '../types/app';

export class OrientationService {
  private currentOrientation: DeviceOrientation | null = null;
  private isListening = false;
  private orientationCallbacks: ((orientation: DeviceOrientation) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private lastUpdateTime = 0;
  private readonly UPDATE_THROTTLE = 50; // Throttle updates to 20fps
  private absoluteOrientationSensor: any = null; // AbsoluteOrientationSensor
  private usingSensorAPI = false;

  async requestPermission(): Promise<PermissionState> {
    // Check for HTTPS requirement
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('AbsoluteOrientationSensor requires HTTPS. Falling back to DeviceOrientationEvent.');
    }

    // Try to use AbsoluteOrientationSensor first (modern API)
    if ('AbsoluteOrientationSensor' in window && location.protocol === 'https:') {
      try {
        // Request permissions for sensor APIs
        const permissions = await Promise.all([
          navigator.permissions.query({ name: 'accelerometer' as PermissionName }),
          navigator.permissions.query({ name: 'gyroscope' as PermissionName }),
          navigator.permissions.query({ name: 'magnetometer' as PermissionName })
        ]);

        const allGranted = permissions.every(result => result.state === 'granted');
        if (allGranted) {
          return PermissionState.GRANTED;
        }

        // If not all granted, check if any are denied
        const anyDenied = permissions.some(result => result.state === 'denied');
        if (anyDenied) {
          console.warn('Some sensor permissions denied, falling back to DeviceOrientationEvent');
          return this.requestDeviceOrientationPermission();
        }

        // If permissions are prompt state, they will be requested when sensor is created
        return PermissionState.GRANTED;
      } catch (error) {
        console.warn('Error checking sensor permissions, falling back to DeviceOrientationEvent:', error);
        return this.requestDeviceOrientationPermission();
      }
    }

    // Fallback to DeviceOrientationEvent
    return this.requestDeviceOrientationPermission();
  }

  private async requestDeviceOrientationPermission(): Promise<PermissionState> {
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

    // Try to use AbsoluteOrientationSensor first
    if ('AbsoluteOrientationSensor' in window && location.protocol === 'https:') {
      try {
        await this.startSensorListening();
        console.log('Started listening with AbsoluteOrientationSensor');
        return;
      } catch (error) {
        console.warn('Failed to start AbsoluteOrientationSensor, falling back to DeviceOrientationEvent:', error);
        this.usingSensorAPI = false;
      }
    }

    // Fallback to DeviceOrientationEvent
    this.startDeviceOrientationListening();
    console.log('Started listening with DeviceOrientationEvent');
  }

  private async startSensorListening(): Promise<void> {
    const AbsoluteOrientationSensor = (window as any).AbsoluteOrientationSensor;
    
    this.absoluteOrientationSensor = new AbsoluteOrientationSensor({ 
      frequency: 20, // 20 Hz for smooth updates
      referenceFrame: 'device' 
    });

    this.absoluteOrientationSensor.addEventListener('reading', () => {
      this.handleSensorReading();
    });

    this.absoluteOrientationSensor.addEventListener('error', (event: any) => {
      console.error('AbsoluteOrientationSensor error:', event.error);
      this.notifyErrorCallbacks(`Sensor error: ${event.error.message}`);
      
      // Fall back to DeviceOrientationEvent on sensor error
      this.usingSensorAPI = false;
      this.startDeviceOrientationListening();
    });

    this.absoluteOrientationSensor.start();
    this.usingSensorAPI = true;
  }

  private startDeviceOrientationListening(): void {
    // Listen for device orientation events
    window.addEventListener('deviceorientation', this.handleOrientationEvent.bind(this), true);
    
    // Also listen for absolute orientation if available
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', this.handleAbsoluteOrientationEvent.bind(this), true);
    }
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;

    // Stop AbsoluteOrientationSensor if using it
    if (this.absoluteOrientationSensor && this.usingSensorAPI) {
      try {
        this.absoluteOrientationSensor.stop();
        this.absoluteOrientationSensor = null;
      } catch (error) {
        console.warn('Error stopping AbsoluteOrientationSensor:', error);
      }
    }

    // Remove DeviceOrientationEvent listeners
    window.removeEventListener('deviceorientation', this.handleOrientationEvent.bind(this), true);
    
    if ('ondeviceorientationabsolute' in window) {
      window.removeEventListener('deviceorientationabsolute', this.handleAbsoluteOrientationEvent.bind(this), true);
    }

    this.usingSensorAPI = false;
    console.log('Stopped listening for device orientation');
  }

  private handleSensorReading(): void {
    if (!this.absoluteOrientationSensor) return;

    const now = Date.now();
    if (now - this.lastUpdateTime < this.UPDATE_THROTTLE) {
      return; // Throttle updates
    }
    this.lastUpdateTime = now;

    try {
      // AbsoluteOrientationSensor provides quaternion data
      const quaternion = this.absoluteOrientationSensor.quaternion;
      if (!quaternion || quaternion.length < 4) {
        return;
      }

      // Convert quaternion to Euler angles
      const eulerAngles = this.quaternionToEuler(quaternion);
      
      const orientation: DeviceOrientation = {
        alpha: this.normalizeAngle(eulerAngles.alpha),
        beta: this.clampAngle(eulerAngles.beta, -180, 180),
        gamma: this.clampAngle(eulerAngles.gamma, -90, 90),
        absolute: true // AbsoluteOrientationSensor always provides absolute orientation
      };

      this.currentOrientation = orientation;
      this.notifyOrientationCallbacks(orientation);
    } catch (error) {
      console.error('Error processing sensor data:', error);
      this.notifyErrorCallbacks(`Sensor reading error: ${error}`);
    }
  }

  private quaternionToEuler(q: number[]): { alpha: number; beta: number; gamma: number } {
    // Convert quaternion [x, y, z, w] to Euler angles
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/AbsoluteOrientationSensor
    const [x, y, z, w] = q;

    // Calculate Euler angles from quaternion
    // Note: These calculations match the expected DeviceOrientationEvent coordinate system
    const alpha = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)) * 180 / Math.PI;
    const beta = Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x)))) * 180 / Math.PI;
    const gamma = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)) * 180 / Math.PI;

    return { alpha, beta, gamma };
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

  isUsingSensorAPI(): boolean {
    return this.usingSensorAPI;
  }

  getOrientationSource(): string {
    return this.usingSensorAPI ? 'AbsoluteOrientationSensor' : 'DeviceOrientationEvent';
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
    return 'AbsoluteOrientationSensor' in window || 'DeviceOrientationEvent' in window;
  }

  // Check if device supports absolute orientation
  static supportsAbsoluteOrientation(): boolean {
    return 'AbsoluteOrientationSensor' in window || 'ondeviceorientationabsolute' in window;
  }

  // Check if AbsoluteOrientationSensor is available
  static supportsAbsoluteOrientationSensor(): boolean {
    return 'AbsoluteOrientationSensor' in window && location.protocol === 'https:';
  }

  // Check if HTTPS is required and available
  static isHttpsRequired(): boolean {
    return location.protocol !== 'https:' && location.hostname !== 'localhost';
  }
}