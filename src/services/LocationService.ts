import { UserLocation, Coordinates, GeolocationError } from '../types/celestial';
import { PermissionState } from '../types/app';

export class LocationService {
  private currentLocation: UserLocation | null = null;
  private watchId: number | null = null;
  private locationCallbacks: ((location: UserLocation) => void)[] = [];
  private errorCallbacks: ((error: GeolocationError) => void)[] = [];

  async requestPermission(): Promise<PermissionState> {
    if (!navigator.geolocation) {
      return PermissionState.DENIED;
    }

    try {
      // Try to get permission by attempting to get location
      await this.getCurrentLocation();
      return PermissionState.GRANTED;
    } catch (error) {
      const geoError = error as GeolocationError;
      if (geoError.code === 1) { // PERMISSION_DENIED
        return PermissionState.DENIED;
      }
      return PermissionState.UNKNOWN;
    }
  }

  async getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        } as GeolocationError);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            timestamp: new Date(),
            accuracy: position.coords.accuracy
          };
          
          this.currentLocation = location;
          this.notifyLocationCallbacks(location);
          resolve(location);
        },
        (error) => {          
          const geoError: GeolocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code)
          };
          
          this.notifyErrorCallbacks(geoError);
          reject(geoError);
        },
        options
      );
    });
  }

  startWatching(): void {
    if (!navigator.geolocation || this.watchId !== null) {
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // 1 minute
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: UserLocation = {
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          timestamp: new Date(),
          accuracy: position.coords.accuracy
        };
        
        this.currentLocation = location;
        this.notifyLocationCallbacks(location);
      },
      (error) => {
        const geoError: GeolocationError = {
          code: error.code,
          message: this.getErrorMessage(error.code)
        };
        
        this.notifyErrorCallbacks(geoError);
      },
      options
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  onLocationUpdate(callback: (location: UserLocation) => void): void {
    this.locationCallbacks.push(callback);
  }

  onLocationError(callback: (error: GeolocationError) => void): void {
    this.errorCallbacks.push(callback);
  }

  removeLocationCallback(callback: (location: UserLocation) => void): void {
    const index = this.locationCallbacks.indexOf(callback);
    if (index > -1) {
      this.locationCallbacks.splice(index, 1);
    }
  }

  removeErrorCallback(callback: (error: GeolocationError) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  getLastKnownLocation(): UserLocation | null {
    return this.currentLocation;
  }

  private notifyLocationCallbacks(location: UserLocation): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  private notifyErrorCallbacks(error: GeolocationError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location information is unavailable';
      case 3:
        return 'Location request timed out';
      default:
        return 'An unknown error occurred while retrieving location';
    }
  }

  // Utility method to calculate distance between two coordinates
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get timezone offset for astronomical calculations
  getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  // Check if coordinates are valid
  static isValidCoordinates(coords: Coordinates): boolean {
    return coords.lat >= -90 && coords.lat <= 90 &&
           coords.lng >= -180 && coords.lng <= 180;
  }
}