# 🌌 Night Sky Navigator

A modern Progressive Web App (PWA) that helps users navigate and explore the night sky with interactive features, device orientation support, and comprehensive educational content.

![Night Sky Navigator](https://img.shields.io/badge/PWA-Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Vite](https://img.shields.io/badge/Vite-4.0+-green)
![License](https://img.shields.io/badge/License-GPL--3.0-red)

## ✨ Features

### 🗺️ Interactive Sky Map
- **Real-time sky visualization** with accurate celestial object positioning
- **Device gyroscope integration** for intuitive navigation
- **Touch and mouse controls** for manual sky exploration
- **Dynamic field of view** adjustment based on device orientation

### 🌟 Celestial Objects Database
- **Popular constellations** with star patterns and connecting lines
- **Planets** with real-time positions and orbital information
- **Stars** with accurate magnitude and color representation
- **Satellites** and **comets** tracking (extensible)
- **Educational information** for each celestial object

### 📍 Location-Based Features
- **GPS integration** for accurate sky positioning
- **Location-based object filtering** showing what's visible from your location
- **Timezone-aware calculations** for precise object positions

### ⭐ Favorites System
- **Save favorite objects** with personal notes
- **Quick access** to your most interesting discoveries
- **Export/import** favorites data
- **Search and filter** your saved objects

### 🔧 Advanced Features
- **PWA functionality** - install on any device, works offline
- **Cache management** with clear cache functionality
- **Multi-theme support** (Dark, Red-light, Green-light themes)
- **Responsive design** - works on phones, tablets, and desktops
- **Accessibility support** with keyboard navigation and screen readers

### 🛡️ Security & Privacy
- **XSS protection** with comprehensive input sanitization
- **Content Security Policy** headers
- **TypeScript** for type safety and error prevention
- **No external data collection** - all data stays on your device

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm OR Docker (recommended)
- Modern web browser with HTML5 and ES2020 support
- HTTPS connection (required for device orientation and location APIs)

### Native Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bpediredla-mg/Night-Sky-Navigator-.git
   cd Night-Sky-Navigator-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   https://localhost:3000
   ```

### Docker Setup (Recommended)

#### Quick Start with Docker
```bash
# Clone the repository
git clone https://github.com/bpediredla-mg/Night-Sky-Navigator-.git
cd Night-Sky-Navigator-

# Start development server (accessible from mobile devices on local network)
docker compose up dev

# Or start production server
docker compose up prod
```

#### Development with Docker
```bash
# Start development server with hot reload
npm run docker:dev
# Access at http://localhost:3000 or http://YOUR_LOCAL_IP:3000

# Run type checking
npm run docker:test

# Run linting
npm run docker:lint

# Build production image
npm run docker:build
```

#### Mobile Device Access
The Docker development server is configured to accept connections from any IP address on your local network. 

1. **Start the development server:**
   ```bash
   docker compose up dev
   ```

2. **Find your local IP address:**
   - Windows: `ipconfig`
   - macOS/Linux: `ifconfig` or `ip addr show`

3. **Access from mobile devices:**
   ```
   http://YOUR_LOCAL_IP:3000
   ```
   
   Example: `http://192.168.1.100:3000`

#### Docker Services
- **Development**: Hot-reload server on port 3000
- **Production**: Optimized nginx server on port 8080
- **Test**: Type checking and validation
- **Lint**: Code style checking

### Building for Production

#### Native
```bash
npm run build
npm run preview
```

#### Docker
```bash
# Build and run production container
docker compose up prod
# Access at http://localhost:8080
```

## 📱 Device Compatibility

### ✅ Fully Supported
- **iOS Safari** 13+ (iPhone/iPad)
- **Android Chrome** 80+
- **Desktop Chrome** 80+
- **Desktop Firefox** 80+
- **Desktop Safari** 13+

### ⚠️ Limited Support
- **Older browsers** - basic functionality without gyroscope
- **HTTP connections** - location and orientation features disabled

## 🎯 Usage Guide

### Getting Started
1. **Allow location access** when prompted for accurate sky positioning
2. **Enable device orientation** for gyroscope-based navigation
3. **Hold your device up** toward the sky and move it around to explore

### Navigation Controls
- **Drag** to manually explore the sky map
- **Tap objects** to view detailed information
- **Use controls panel** to filter object types
- **Center view button** to reset to device orientation

### Adding Favorites
1. **Tap any celestial object** to open its information panel
2. **Click the star button** to add/remove from favorites
3. **Access favorites** from the navigation menu

### Cache Management
- **Clear cache** button removes all cached data
- **Preserves** your settings and favorites
- **Useful** when experiencing performance issues

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # UI components
│   ├── SkyNavigator.ts  # Main application component
│   ├── SkyCanvas.ts     # Sky map rendering
│   └── ObjectPanel.ts   # Object information display
├── services/            # Business logic services
│   ├── LocationService.ts      # GPS and geolocation
│   ├── OrientationService.ts   # Device orientation
│   ├── ServiceWorkerService.ts # PWA functionality
│   └── FavoritesService.ts     # Favorites management
├── data/               # Celestial object databases
│   ├── constellations.ts
│   ├── planets.ts
│   └── satellites.ts
├── types/              # TypeScript definitions
│   ├── celestial.ts    # Astronomical types
│   └── app.ts          # Application types
├── styles/             # CSS styling
│   └── main.css        # Main stylesheet
└── utils/              # Utility functions
```

### Key Technologies
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Canvas API** - High-performance sky map rendering
- **Service Workers** - Offline functionality and caching
- **Web APIs** - Geolocation, Device Orientation, Local Storage

## 🧭 Astronomical Accuracy

### Coordinate Systems
- **Right Ascension/Declination** for celestial positioning
- **Azimuth/Altitude** for horizon-based coordinates
- **Real-time calculations** based on user location and time

### Object Data
- **Star magnitudes** and **spectral classes** for realistic rendering
- **Planetary positions** calculated for current date/time
- **Constellation patterns** based on traditional star connections
- **Educational content** sourced from astronomical databases

### Limitations
- **Simplified calculations** - not suitable for professional astronomy
- **Static object positions** - planets don't move in real-time
- **Limited catalog** - focuses on brightest and most popular objects

## 🔧 Development

### Scripts
```bash
# Native Scripts
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run type-check # TypeScript type checking

# Docker Scripts
npm run docker:dev      # Start development server in Docker
npm run docker:prod     # Start production server in Docker
npm run docker:test     # Run type checking in Docker
npm run docker:lint     # Run linting in Docker
npm run docker:build    # Build production Docker image
npm run docker:build-dev # Build development Docker image
```

### Docker Development Workflow

#### Option 1: Docker Compose (Recommended)
```bash
# Start development with hot reload
docker compose up dev

# Start production server
docker compose up prod

# Run tests
docker compose run --rm test

# Run linting
docker compose run --rm lint
```

#### Option 2: Direct Docker Commands
```bash
# Build development image
docker build -f Dockerfile.dev -t night-sky-navigator:dev .

# Run development server
docker run -p 3000:3000 -v $(pwd):/app night-sky-navigator:dev

# Build production image
docker build -t night-sky-navigator:prod .

# Run production server
docker run -p 8080:80 night-sky-navigator:prod
```

### Accessing from Mobile Devices

1. **Start Docker development server:**
   ```bash
   docker compose up dev
   ```

2. **Find your computer's local IP:**
   ```bash
   # On Windows
   ipconfig | findstr "IPv4"
   
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. **Connect from mobile device:**
   - Open browser on your phone/tablet
   - Navigate to `http://YOUR_LOCAL_IP:3000`
   - Example: `http://192.168.1.100:3000`

### Adding New Objects
1. **Define object** in appropriate data file (e.g., `src/data/planets.ts`)
2. **Include coordinates** and educational information
3. **Add to object database** in SkyNavigator component
4. **Test rendering** in sky canvas

### Customizing Themes
- **Modify CSS variables** in `src/styles/main.css`
- **Add new theme** to `Theme` enum in `src/types/app.ts`
- **Implement theme switching** in settings component

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with tests
4. **Submit** a pull request

### Reporting Issues
- **Use GitHub Issues** for bug reports and feature requests
- **Include** device information and browser details
- **Provide** steps to reproduce any issues

## 📜 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

### Key Points
- ✅ **Free to use** and modify
- ✅ **Open source** contributions welcome
- ⚠️ **Copyleft license** - derivatives must also be GPL
- ⚠️ **No warranty** provided

## 🙏 Acknowledgments

- **Astronomical data** from various open-source catalogs
- **Constellation mythology** from classical sources
- **Star positions** based on Hipparcos catalog
- **Planet data** from NASA/JPL ephemeris

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Email security issues privately

---

**Made with ❤️ for astronomy enthusiasts around the world** 🌍🌟
