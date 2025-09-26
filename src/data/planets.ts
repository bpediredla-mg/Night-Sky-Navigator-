import { Planet, CelestialObjectType } from '../types/celestial';

export const planets: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: CelestialObjectType.PLANET,
    coordinates: {
      rightAscension: 0, // This would be calculated dynamically based on current date
      declination: 0
    },
    magnitude: -0.4,
    orbitalPeriod: 88,
    diameter: 4879,
    distanceFromSun: 0.39,
    description: 'The smallest planet and closest to the Sun',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The innermost planet, racing around the Sun',
      detailedDescription: 'Mercury is the smallest planet in our solar system and the closest to the Sun. It orbits the Sun every 88 Earth days and has extreme temperature variations.',
      facts: [
        'Smallest planet in our solar system',
        'Closest planet to the Sun',
        'Has extreme temperature variations (-173°C to 427°C)',
        'No atmosphere to retain heat',
        'One year on Mercury equals 88 Earth days',
        'No moons or rings'
      ],
      discovery: {
        discoverer: 'Known to ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      },
      physicalProperties: {
        distance: '0.39 AU from Sun',
        size: '4,879 km diameter',
        temperature: '-173°C to 427°C',
        composition: ['Iron core', 'Thin silicate mantle', 'No significant atmosphere']
      }
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    type: CelestialObjectType.PLANET,
    coordinates: {
      rightAscension: 0,
      declination: 0
    },
    magnitude: -4.6,
    orbitalPeriod: 225,
    diameter: 12104,
    distanceFromSun: 0.72,
    description: 'The hottest planet, often called Earth\'s twin',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The hottest planet, shrouded in thick clouds',
      detailedDescription: 'Venus is the second planet from the Sun and the hottest in our solar system. It\'s often called Earth\'s twin due to similar size, but has a crushing atmosphere and extreme greenhouse effect.',
      facts: [
        'Hottest planet in the solar system (462°C surface temperature)',
        'Thick atmosphere of carbon dioxide with sulfuric acid clouds',
        'Rotates backwards (retrograde rotation)',
        'One day on Venus is longer than one year',
        'Brightest planet as seen from Earth',
        'No moons or rings'
      ],
      discovery: {
        discoverer: 'Known to ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      },
      physicalProperties: {
        distance: '0.72 AU from Sun',
        size: '12,104 km diameter',
        temperature: '462°C surface temperature',
        composition: ['Iron core', 'Rocky mantle', 'Dense CO₂ atmosphere']
      }
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    type: CelestialObjectType.PLANET,
    coordinates: {
      rightAscension: 0,
      declination: 0
    },
    magnitude: -2.9,
    orbitalPeriod: 687,
    diameter: 6792,
    distanceFromSun: 1.52,
    moons: ['Phobos', 'Deimos'],
    description: 'The Red Planet, a cold desert world',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The Red Planet, target of human exploration',
      detailedDescription: 'Mars is the fourth planet from the Sun and is often called the Red Planet due to iron oxide on its surface. It has the largest volcano and canyon in the solar system.',
      facts: [
        'Called the Red Planet due to iron oxide (rust) on surface',
        'Has the largest volcano in the solar system (Olympus Mons)',
        'Home to the largest canyon (Valles Marineris)',
        'Has polar ice caps made of water and carbon dioxide',
        'Day length similar to Earth (24 hours 37 minutes)',
        'Two small moons: Phobos and Deimos'
      ],
      discovery: {
        discoverer: 'Known to ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      },
      physicalProperties: {
        distance: '1.52 AU from Sun',
        size: '6,792 km diameter',
        temperature: '-87°C to -5°C',
        composition: ['Iron core', 'Rocky mantle', 'Thin CO₂ atmosphere']
      }
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: CelestialObjectType.PLANET,
    coordinates: {
      rightAscension: 0,
      declination: 0
    },
    magnitude: -2.9,
    orbitalPeriod: 4333,
    diameter: 142984,
    distanceFromSun: 5.20,
    moons: ['Io', 'Europa', 'Ganymede', 'Callisto'],
    description: 'The largest planet, a gas giant with a Great Red Spot',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The gas giant with a famous Great Red Spot storm',
      detailedDescription: 'Jupiter is the largest planet in our solar system. It\'s a gas giant with a Great Red Spot - a giant storm larger than Earth that has been raging for centuries.',
      facts: [
        'Largest planet in our solar system',
        'Great Red Spot is a storm larger than Earth',
        'Has at least 79 known moons',
        'Could fit all other planets inside it',
        'Acts as a "cosmic vacuum cleaner" protecting inner planets',
        'Made mostly of hydrogen and helium'
      ],
      discovery: {
        discoverer: 'Known to ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      },
      physicalProperties: {
        distance: '5.20 AU from Sun',
        size: '142,984 km diameter',
        temperature: '-108°C at cloud tops',
        composition: ['Hydrogen and helium atmosphere', 'Possible rocky core']
      }
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: CelestialObjectType.PLANET,
    coordinates: {
      rightAscension: 0,
      declination: 0
    },
    magnitude: 0.7,
    orbitalPeriod: 10759,
    diameter: 120536,
    distanceFromSun: 9.58,
    moons: ['Titan', 'Enceladus', 'Mimas', 'Iapetus'],
    description: 'The ringed planet, known for its spectacular ring system',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The beautiful ringed planet',
      detailedDescription: 'Saturn is the sixth planet from the Sun and is famous for its spectacular ring system. It\'s a gas giant and the least dense planet in our solar system.',
      facts: [
        'Famous for its spectacular ring system',
        'Least dense planet - would float in water',
        'Has at least 82 known moons',
        'Titan, its largest moon, has lakes of liquid methane',
        'Hexagonal storm at its north pole',
        'Made mostly of hydrogen and helium'
      ],
      discovery: {
        discoverer: 'Known to ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      },
      physicalProperties: {
        distance: '9.58 AU from Sun',
        size: '120,536 km diameter',
        temperature: '-139°C at cloud tops',
        composition: ['Hydrogen and helium atmosphere', 'Possible rocky core', 'Ice and rock rings']
      }
    }
  }
];

export const getPlanetById = (id: string): Planet | undefined => {
  return planets.find(planet => planet.id === id);
};

export const getVisiblePlanets = (): Planet[] => {
  return planets.filter(planet => planet.isVisible);
};