import { Constellation, CelestialObjectType, Season } from '../types/celestial';

export const constellations: Constellation[] = [
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    type: CelestialObjectType.CONSTELLATION,
    coordinates: {
      rightAscension: 11.0,
      declination: 50.0
    },
    description: 'The Great Bear, containing the famous Big Dipper asterism',
    season: Season.ALL_YEAR,
    mythology: 'In Greek mythology, Ursa Major represents Callisto, a nymph who was transformed into a bear by Zeus\'s jealous wife Hera.',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'Third largest constellation, home to the Big Dipper',
      detailedDescription: 'Ursa Major is the third largest of the 88 modern constellations. It contains the well-known asterism known as the Big Dipper or Plough. Seven of its stars form the Big Dipper asterism, and the brightest star is Alioth.',
      facts: [
        'Contains the Big Dipper, one of the most recognizable star patterns',
        'Home to several galaxies including M81 and M82',
        'The pointer stars Dubhe and Merak point toward Polaris',
        'Visible year-round from most northern hemisphere locations'
      ],
      mythology: 'According to Greek mythology, the constellation represents Callisto, who was turned into a bear by the jealous Hera and placed in the sky by Zeus.',
      discovery: {
        discoverer: 'Ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      }
    },
    stars: [
      {
        id: 'dubhe',
        name: 'Dubhe',
        coordinates: { rightAscension: 11.06, declination: 61.75 },
        magnitude: 1.79,
        spectralClass: 'K0III',
        color: '#ffcc99'
      },
      {
        id: 'merak',
        name: 'Merak',
        coordinates: { rightAscension: 11.02, declination: 56.38 },
        magnitude: 2.37,
        spectralClass: 'A1V',
        color: '#ffffff'
      },
      {
        id: 'phecda',
        name: 'Phecda',
        coordinates: { rightAscension: 11.90, declination: 53.69 },
        magnitude: 2.44,
        spectralClass: 'A0V',
        color: '#ffffff'
      },
      {
        id: 'megrez',
        name: 'Megrez',
        coordinates: { rightAscension: 12.26, declination: 57.03 },
        magnitude: 3.31,
        spectralClass: 'A3V',
        color: '#ffffff'
      },
      {
        id: 'alioth',
        name: 'Alioth',
        coordinates: { rightAscension: 12.90, declination: 55.96 },
        magnitude: 1.77,
        spectralClass: 'A0pCr',
        color: '#ffffff'
      },
      {
        id: 'mizar',
        name: 'Mizar',
        coordinates: { rightAscension: 13.40, declination: 54.93 },
        magnitude: 2.27,
        spectralClass: 'A2V',
        color: '#ffffff'
      },
      {
        id: 'alkaid',
        name: 'Alkaid',
        coordinates: { rightAscension: 13.79, declination: 49.31 },
        magnitude: 1.86,
        spectralClass: 'B3V',
        color: '#b3d9ff'
      }
    ],
    lines: [
      { from: 'dubhe', to: 'merak' },
      { from: 'merak', to: 'phecda' },
      { from: 'phecda', to: 'megrez' },
      { from: 'megrez', to: 'alioth' },
      { from: 'alioth', to: 'mizar' },
      { from: 'mizar', to: 'alkaid' },
      { from: 'megrez', to: 'dubhe' }
    ]
  },
  {
    id: 'orion',
    name: 'Orion',
    type: CelestialObjectType.CONSTELLATION,
    coordinates: {
      rightAscension: 5.5,
      declination: 0.0
    },
    description: 'The Hunter, one of the most recognizable constellations',
    season: Season.WINTER,
    mythology: 'Orion was a great hunter in Greek mythology, placed among the stars by Zeus.',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The Hunter constellation, visible worldwide',
      detailedDescription: 'Orion is one of the most conspicuous and recognizable constellations in the night sky. It can be seen throughout the world and is named after Orion, a hunter in Greek mythology.',
      facts: [
        'Contains the famous Orion Nebula (M42)',
        'Home to two first-magnitude stars: Rigel and Betelgeuse',
        'The three belt stars point to Sirius',
        'Visible from both hemispheres'
      ],
      mythology: 'In Greek mythology, Orion was a great hunter who boasted he could kill any animal on Earth.',
      discovery: {
        discoverer: 'Ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      }
    },
    stars: [
      {
        id: 'betelgeuse',
        name: 'Betelgeuse',
        coordinates: { rightAscension: 5.95, declination: 7.41 },
        magnitude: 0.58,
        spectralClass: 'M1-2Ia-Iab',
        color: '#ffcc33'
      },
      {
        id: 'rigel',
        name: 'Rigel',
        coordinates: { rightAscension: 5.24, declination: -8.20 },
        magnitude: 0.18,
        spectralClass: 'B8Ia',
        color: '#b3d9ff'
      },
      {
        id: 'alnitak',
        name: 'Alnitak',
        coordinates: { rightAscension: 5.68, declination: -1.94 },
        magnitude: 1.77,
        spectralClass: 'O9.5Iab',
        color: '#b3d9ff'
      },
      {
        id: 'alnilam',
        name: 'Alnilam',
        coordinates: { rightAscension: 5.60, declination: -1.20 },
        magnitude: 1.69,
        spectralClass: 'B0Ia',
        color: '#b3d9ff'
      },
      {
        id: 'mintaka',
        name: 'Mintaka',
        coordinates: { rightAscension: 5.53, declination: -0.30 },
        magnitude: 2.23,
        spectralClass: 'O9.5II',
        color: '#b3d9ff'
      }
    ],
    lines: [
      { from: 'betelgeuse', to: 'alnitak' },
      { from: 'alnitak', to: 'alnilam' },
      { from: 'alnilam', to: 'mintaka' },
      { from: 'mintaka', to: 'rigel' },
      { from: 'rigel', to: 'betelgeuse' }
    ]
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    type: CelestialObjectType.CONSTELLATION,
    coordinates: {
      rightAscension: 1.0,
      declination: 60.0
    },
    description: 'The Queen, forming a distinctive W shape',
    season: Season.ALL_YEAR,
    mythology: 'Cassiopeia was a vain queen in Greek mythology, punished by being placed upside down in the sky.',
    isVisible: true,
    isFavorited: false,
    educationalInfo: {
      shortDescription: 'The Queen constellation, forming a distinctive W shape',
      detailedDescription: 'Cassiopeia is a constellation in the northern sky, named after the vain queen Cassiopeia in Greek mythology. It is easily recognizable due to its distinctive W shape.',
      facts: [
        'Forms a distinctive W or M shape depending on orientation',
        'Contains several notable star clusters',
        'Visible year-round from northern latitudes',
        'One of the 48 constellations listed by Ptolemy'
      ],
      mythology: 'Cassiopeia was the wife of King Cepheus and mother of Andromeda. Her vanity led to her punishment by Poseidon.',
      discovery: {
        discoverer: 'Ancient civilizations',
        year: -3000,
        method: 'Naked eye observation'
      }
    },
    stars: [
      {
        id: 'schedar',
        name: 'Schedar',
        coordinates: { rightAscension: 0.67, declination: 56.54 },
        magnitude: 2.24,
        spectralClass: 'K0IIIa',
        color: '#ffcc99'
      },
      {
        id: 'caph',
        name: 'Caph',
        coordinates: { rightAscension: 0.15, declination: 59.15 },
        magnitude: 2.28,
        spectralClass: 'F2III-IV',
        color: '#ffffcc'
      },
      {
        id: 'gamma-cas',
        name: 'Gamma Cassiopeiae',
        coordinates: { rightAscension: 0.95, declination: 60.72 },
        magnitude: 2.15,
        spectralClass: 'B0.5IVe',
        color: '#b3d9ff'
      }
    ],
    lines: [
      { from: 'caph', to: 'schedar' },
      { from: 'schedar', to: 'gamma-cas' }
    ]
  }
];

export const getConstellationById = (id: string): Constellation | undefined => {
  return constellations.find(constellation => constellation.id === id);
};

export const getConstellationsBySeason = (season: Season): Constellation[] => {
  return constellations.filter(constellation => 
    constellation.season === season || constellation.season === Season.ALL_YEAR
  );
};