import { CelestialObject } from '../types/celestial';
import { FavoritesService } from '../services/FavoritesService';

export class ObjectPanel {
  private panelElement: HTMLElement;
  private favoritesService: FavoritesService;
  private currentObject: CelestialObject | null = null;

  constructor(panelId: string) {
    const panel = document.getElementById(panelId);
    if (!panel) {
      throw new Error(`Panel element with id ${panelId} not found`);
    }
    
    this.panelElement = panel;
    this.favoritesService = new FavoritesService();
  }

  showObject(object: CelestialObject): void {
    this.currentObject = object;
    this.panelElement.classList.add('visible');
    this.renderObjectInfo();
  }

  hide(): void {
    this.panelElement.classList.remove('visible');
    this.currentObject = null;
  }

  private renderObjectInfo(): void {
    if (!this.currentObject) return;

    const object = this.currentObject;
    const isFavorited = this.favoritesService.isFavorited(object.id);

    this.panelElement.innerHTML = `
      <div class="object-header">
        <div>
          <div class="object-type">${this.formatObjectType(object.type)}</div>
          <h2 class="object-title">${this.sanitizeHtml(object.name)}</h2>
        </div>
        <button class="close-panel" onclick="this.closest('.object-info-panel').classList.remove('visible')">
          ×
        </button>
      </div>
      
      <div class="object-description">
        ${this.sanitizeHtml(object.description)}
      </div>
      
      <div class="object-properties">
        ${this.renderObjectProperties(object)}
      </div>
      
      <div class="educational-content">
        <h3 style="color: var(--accent-text); margin-bottom: 1rem; font-size: 1.1rem;">
          📚 Learn More
        </h3>
        
        <div class="educational-section">
          <h4 style="color: var(--secondary-text); margin-bottom: 0.5rem; font-size: 0.9rem;">
            Overview
          </h4>
          <p style="color: var(--primary-text); line-height: 1.6; margin-bottom: 1rem;">
            ${this.sanitizeHtml(object.educationalInfo.detailedDescription)}
          </p>
        </div>
        
        ${object.educationalInfo.facts.length > 0 ? `
          <div class="educational-section">
            <h4 style="color: var(--secondary-text); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Interesting Facts
            </h4>
            <ul style="color: var(--primary-text); padding-left: 1.2rem; line-height: 1.6;">
              ${object.educationalInfo.facts.map(fact => 
                `<li style="margin-bottom: 0.5rem;">${this.sanitizeHtml(fact)}</li>`
              ).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${object.educationalInfo.mythology ? `
          <div class="educational-section">
            <h4 style="color: var(--secondary-text); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Mythology
            </h4>
            <p style="color: var(--primary-text); line-height: 1.6;">
              ${this.sanitizeHtml(object.educationalInfo.mythology)}
            </p>
          </div>
        ` : ''}
        
        ${object.educationalInfo.discovery ? `
          <div class="educational-section">
            <h4 style="color: var(--secondary-text); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Discovery
            </h4>
            <p style="color: var(--primary-text); line-height: 1.6;">
              ${this.formatDiscoveryInfo(object.educationalInfo.discovery)}
            </p>
          </div>
        ` : ''}
        
        ${object.educationalInfo.physicalProperties ? `
          <div class="educational-section">
            <h4 style="color: var(--secondary-text); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Physical Properties
            </h4>
            <div class="property-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; color: var(--primary-text);">
              ${Object.entries(object.educationalInfo.physicalProperties)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `
                  <div class="property">
                    <span class="property-label">${this.formatPropertyLabel(key)}:</span>
                    <span class="property-value">${this.sanitizeHtml(String(value))}</span>
                  </div>
                `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      <button class="favorite-button ${isFavorited ? 'favorited' : ''}" 
              onclick="this.toggleFavorite()" 
              data-object-id="${object.id}">
        <span style="font-size: 1.2rem;">${isFavorited ? '⭐' : '☆'}</span>
        ${isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    `;

    // Add event listener for favorite button
    const favoriteBtn = this.panelElement.querySelector('.favorite-button') as HTMLButtonElement;
    if (favoriteBtn) {
      favoriteBtn.onclick = () => this.toggleFavorite();
    }
  }

  private renderObjectProperties(object: CelestialObject): string {
    const properties: Array<{ label: string; value: string }> = [];

    // Common properties
    if (object.coordinates.rightAscension !== undefined) {
      properties.push({
        label: 'Right Ascension',
        value: this.formatRA(object.coordinates.rightAscension)
      });
    }

    if (object.coordinates.declination !== undefined) {
      properties.push({
        label: 'Declination',
        value: this.formatDeclination(object.coordinates.declination)
      });
    }

    if (object.magnitude !== undefined) {
      properties.push({
        label: 'Magnitude',
        value: object.magnitude.toFixed(1)
      });
    }

    // Type-specific properties
    if (object.type === 'planet') {
      const planet = object as any;
      if (planet.diameter) {
        properties.push({
          label: 'Diameter',
          value: `${planet.diameter.toLocaleString()} km`
        });
      }
      if (planet.distanceFromSun) {
        properties.push({
          label: 'Distance from Sun',
          value: `${planet.distanceFromSun} AU`
        });
      }
      if (planet.orbitalPeriod) {
        properties.push({
          label: 'Orbital Period',
          value: `${planet.orbitalPeriod} days`
        });
      }
      if (planet.moons && planet.moons.length > 0) {
        properties.push({
          label: 'Major Moons',
          value: planet.moons.slice(0, 4).join(', ') + (planet.moons.length > 4 ? '...' : '')
        });
      }
    }

    if (object.type === 'constellation') {
      const constellation = object as any;
      if (constellation.season) {
        properties.push({
          label: 'Best Season',
          value: this.formatSeason(constellation.season)
        });
      }
      if (constellation.stars) {
        properties.push({
          label: 'Main Stars',
          value: constellation.stars.length.toString()
        });
      }
    }

    return properties.map(prop => `
      <div class="property">
        <span class="property-label">${this.sanitizeHtml(prop.label)}</span>
        <span class="property-value">${this.sanitizeHtml(prop.value)}</span>
      </div>
    `).join('');
  }

  private toggleFavorite(): void {
    if (!this.currentObject) return;

    const wasFavorited = this.favoritesService.isFavorited(this.currentObject.id);
    
    if (wasFavorited) {
      this.favoritesService.removeFavorite(this.currentObject.id);
    } else {
      this.favoritesService.addFavorite(this.currentObject.id);
    }

    // Update the button
    const favoriteBtn = this.panelElement.querySelector('.favorite-button') as HTMLButtonElement;
    if (favoriteBtn) {
      const isFavorited = this.favoritesService.isFavorited(this.currentObject.id);
      favoriteBtn.classList.toggle('favorited', isFavorited);
      favoriteBtn.innerHTML = `
        <span style="font-size: 1.2rem;">${isFavorited ? '⭐' : '☆'}</span>
        ${isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
      `;
    }
  }

  private formatObjectType(type: string): string {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatRA(ra: number): string {
    const hours = Math.floor(ra);
    const minutes = Math.floor((ra - hours) * 60);
    const seconds = Math.floor(((ra - hours) * 60 - minutes) * 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  private formatDeclination(dec: number): string {
    const sign = dec >= 0 ? '+' : '-';
    const absDec = Math.abs(dec);
    const degrees = Math.floor(absDec);
    const minutes = Math.floor((absDec - degrees) * 60);
    const seconds = Math.floor(((absDec - degrees) * 60 - minutes) * 60);
    return `${sign}${degrees}° ${minutes}' ${seconds}"`;
  }

  private formatSeason(season: string): string {
    return season.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatDiscoveryInfo(discovery: any): string {
    const parts: string[] = [];
    
    if (discovery.discoverer) {
      parts.push(`Discovered by ${discovery.discoverer}`);
    }
    
    if (discovery.year) {
      if (discovery.year < 0) {
        parts.push(`in ${Math.abs(discovery.year)} BCE`);
      } else {
        parts.push(`in ${discovery.year}`);
      }
    }
    
    if (discovery.method) {
      parts.push(`using ${discovery.method}`);
    }
    
    return parts.join(' ') || 'Discovery information not available';
  }

  private formatPropertyLabel(key: string): string {
    return key.split(/(?=[A-Z])/).join(' ')
      .split('_').join(' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private sanitizeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}