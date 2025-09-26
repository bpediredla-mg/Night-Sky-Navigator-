export interface AppSettings {
  theme: Theme;
  showConstellationLines: boolean;
  showConstellationNames: boolean;
  showPlanetLabels: boolean;
  enableGyroscope: boolean;
  locationPermission: boolean;
  notifications: boolean;
  magnitude_limit: number;
}

export enum Theme {
  DARK = 'dark',
  RED = 'red',
  GREEN = 'green'
}

export interface FavoriteObject {
  objectId: string;
  addedAt: Date;
  notes?: string;
}

export interface CacheInfo {
  version: string;
  lastUpdated: Date;
  size: number;
}

export interface NavigationState {
  currentView: ViewType;
  selectedObject?: string;
  searchQuery?: string;
  filters: ObjectFilters;
}

export enum ViewType {
  SKY_MAP = 'sky-map',
  OBJECT_LIST = 'object-list',
  FAVORITES = 'favorites',
  SETTINGS = 'settings',
  EDUCATION = 'education'
}

export interface ObjectFilters {
  type: string[];
  visibility: VisibilityFilter;
  magnitude: MagnitudeRange;
  season?: string;
}

export enum VisibilityFilter {
  ALL = 'all',
  VISIBLE_NOW = 'visible-now',
  TONIGHT = 'tonight'
}

export interface MagnitudeRange {
  min: number;
  max: number;
}



export interface PermissionStatus {
  geolocation: PermissionState;
  deviceOrientation: PermissionState;
  notifications: PermissionState;
}

export enum PermissionState {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt',
  UNKNOWN = 'unknown'
}