export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CelestialCoordinates {
  rightAscension: number; // in hours (0-24)
  declination: number;    // in degrees (-90 to +90)
  azimuth?: number;       // in degrees (0-360)
  altitude?: number;      // in degrees (-90 to +90)
}

export interface CelestialObject {
  id: string;
  name: string;
  type: CelestialObjectType;
  coordinates: CelestialCoordinates;
  magnitude?: number;     // brightness
  description: string;
  educationalInfo: EducationalInfo;
  isVisible: boolean;
  isFavorited: boolean;
  imageUrl?: string;
}

export enum CelestialObjectType {
  CONSTELLATION = 'constellation',
  PLANET = 'planet',
  COMET = 'comet',
  SATELLITE = 'satellite',
  STAR = 'star',
  NEBULA = 'nebula',
  GALAXY = 'galaxy',
  ASTEROID = 'asteroid'
}

export interface EducationalInfo {
  shortDescription: string;
  detailedDescription: string;
  facts: string[];
  mythology?: string;
  discovery?: {
    discoverer?: string;
    year?: number;
    method?: string;
  };
  physicalProperties?: {
    distance?: string;
    size?: string;
    temperature?: string;
    composition?: string[];
  };
}

export interface Constellation extends CelestialObject {
  stars: Star[];
  lines: ConstellationLine[];
  season: Season;
  mythology: string;
}

export interface Star {
  id: string;
  name: string;
  coordinates: CelestialCoordinates;
  magnitude: number;
  spectralClass: string;
  color: string;
}

export interface ConstellationLine {
  from: string; // star id
  to: string;   // star id
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL_YEAR = 'all-year'
}

export interface Planet extends CelestialObject {
  orbitalPeriod: number; // in Earth days
  diameter: number;      // in km
  distanceFromSun: number; // in AU
  moons?: string[];
}

export interface Satellite extends CelestialObject {
  orbitHeight: number;   // in km
  orbitPeriod: number;   // in minutes
  launchDate: Date;
  purpose: string;
}

export interface UserLocation {
  coordinates: Coordinates;
  timestamp: Date;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface DeviceOrientation {
  alpha: number;  // compass heading
  beta: number;   // tilt front/back
  gamma: number;  // tilt left/right
  absolute: boolean;
}

export interface SkyViewport {
  centerAzimuth: number;
  centerAltitude: number;
  fieldOfView: number;
  orientation: DeviceOrientation;
}

export interface AstronomicalEvent {
  id: string;
  name: string;
  type: EventType;
  startTime: Date;
  endTime: Date;
  description: string;
  visibility: Coordinates[];
  objects: string[]; // celestial object ids
}

export enum EventType {
  ECLIPSE = 'eclipse',
  CONJUNCTION = 'conjunction',
  OPPOSITION = 'opposition',
  METEOR_SHOWER = 'meteor_shower',
  COMET_VISIBLE = 'comet_visible',
  PLANET_TRANSIT = 'planet_transit'
}