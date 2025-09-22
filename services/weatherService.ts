interface WeatherData {
  temperature: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  weatherType: 'sunny' | 'cloudy' | 'rainy';
  date: string;
  cached: boolean;
}

interface WeatherCategory {
  type: 'cold' | 'medium' | 'hot';
  emoji: string;
  color: string;
  message: string;
}

interface WeatherCondition {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  emoji: string;
  animation: string;
  message: string;
}

class WeatherService {
  private static instance: WeatherService;
  private readonly CACHE_KEY = 'madeleine_weather_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours cache
  private readonly LONDON_LAT = 51.5074;
  private readonly LONDON_LON = -0.1278;

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  private getCachedWeather(): WeatherData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const cacheTime = new Date(data.cacheTime).getTime();
      const now = Date.now();
      
      // Check if cache is still valid (same day and within duration)
      const today = new Date().toDateString();
      const cacheDay = new Date(cacheTime).toDateString();
      
      if (today === cacheDay && (now - cacheTime) < this.CACHE_DURATION) {
        return { ...data.weather, cached: true };
      }
      
      return null;
    } catch (error) {
      console.error('Error reading weather cache:', error);
      return null;
    }
  }

  private cacheWeather(weather: WeatherData): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = {
        weather,
        cacheTime: new Date().toISOString()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching weather:', error);
    }
  }

  public async fetchWeather(): Promise<WeatherData> {
    // Check cache first
    const cached = this.getCachedWeather();
    if (cached) {
      return cached;
    }

    try {
      // Use Open-Meteo API with hourly data for better daytime analysis
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${this.LONDON_LAT}&` +
        `longitude=${this.LONDON_LON}&` +
        `daily=temperature_2m_max,temperature_2m_min&` +
        `hourly=temperature_2m,precipitation,cloudcover,weathercode&` +
        `timezone=Europe/London&` +
        `forecast_days=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }

      const data = await response.json();
      
      // Analyze 8am to 5pm (indices 8-17 in hourly data)
      const daytimeHours = data.hourly.weathercode.slice(8, 18);
      const daytimePrecipitation = data.hourly.precipitation.slice(8, 18);
      const daytimeCloudcover = data.hourly.cloudcover.slice(8, 18);
      
      // Determine weather type for daytime
      let weatherType: 'sunny' | 'cloudy' | 'rainy' = 'sunny';
      
      // Check for any rain during daytime
      const hasRain = daytimePrecipitation.some((p: number) => p > 0.1);
      
      if (hasRain) {
        weatherType = 'rainy';
      } else {
        // Calculate average cloud cover for daytime
        const avgCloudCover = daytimeCloudcover.reduce((a: number, b: number) => a + b, 0) / daytimeCloudcover.length;
        weatherType = avgCloudCover > 50 ? 'cloudy' : 'sunny';
      }
      
      // Use the predominant weather code from daytime
      const weatherCodeCounts: Record<number, number> = {};
      daytimeHours.forEach((code: number) => {
        weatherCodeCounts[code] = (weatherCodeCounts[code] || 0) + 1;
      });
      const predominantCode = Number(
        Object.keys(weatherCodeCounts).reduce((a, b) => 
          weatherCodeCounts[Number(a)] > weatherCodeCounts[Number(b)] ? a : b
        )
      );
      
      // Get today's data
      const weather: WeatherData = {
        temperature: Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2),
        temperatureMax: Math.round(data.daily.temperature_2m_max[0]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[0]),
        weatherCode: predominantCode,
        weatherType: weatherType,
        date: data.daily.time[0],
        cached: false
      };

      // Cache the result
      this.cacheWeather(weather);
      
      return weather;
    } catch (error) {
      console.error('Error fetching weather:', error);
      
      // Return default weather if fetch fails
      return {
        temperature: 18,
        temperatureMax: 20,
        temperatureMin: 16,
        weatherCode: 1,
        weatherType: 'cloudy',
        date: new Date().toISOString().split('T')[0],
        cached: false
      };
    }
  }

  public getTemperatureCategory(temperature: number): WeatherCategory {
    if (temperature <= 14) {
      return {
        type: 'cold',
        emoji: '🥶',
        color: '#4FC3F7',
        message: "It's cold today! Bundle up warm!"
      };
    } else if (temperature >= 25) {
      return {
        type: 'hot',
        emoji: '🥵',
        color: '#FF7043',
        message: "It's hot today! Stay cool!"
      };
    } else {
      return {
        type: 'medium',
        emoji: '😊',
        color: '#66BB6A',
        message: "Perfect weather to play outside!"
      };
    }
  }

  public getSimpleWeatherCondition(weatherType: 'sunny' | 'cloudy' | 'rainy'): WeatherCondition {
    switch (weatherType) {
      case 'sunny':
        return {
          type: 'sunny',
          emoji: '☀️',
          animation: 'sunny',
          message: ''
        };
      case 'rainy':
        return {
          type: 'rainy',
          emoji: '🌧️',
          animation: 'rainy',
          message: ''
        };
      case 'cloudy':
      default:
        return {
          type: 'cloudy',
          emoji: '☁️',
          animation: 'cloudy',
          message: ''
        };
    }
  }

  public getClothingSuggestion(temp: WeatherCategory, condition: WeatherCondition): string[] {
    const clothes: string[] = [];
    
    // Temperature-based clothing
    if (temp.type === 'cold') {
      clothes.push('🧥 Warm coat');
      clothes.push('🧤 Gloves');
      clothes.push('🧣 Scarf');
      clothes.push('👢 Boots');
    } else if (temp.type === 'hot') {
      clothes.push('👕 T-shirt');
      clothes.push('🩳 Shorts');
      clothes.push('🧢 Sun hat');
      clothes.push('😎 Sunglasses');
    } else {
      clothes.push('👔 Light jacket');
      clothes.push('👖 Comfortable pants');
      clothes.push('👟 Sneakers');
    }
    
    // Weather-based additions
    if (condition.type === 'rainy' || condition.type === 'stormy') {
      clothes.push('☂️ Umbrella');
      clothes.push('🥾 Rain boots');
    }
    
    if (condition.type === 'snowy') {
      clothes.push('🎿 Snow boots');
      clothes.push('❄️ Extra warm clothes');
    }
    
    if (condition.type === 'sunny' && temp.type !== 'cold') {
      clothes.push('🧴 Sunscreen');
    }
    
    return clothes;
  }

  public getDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  public getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-UK', options);
  }
}

export const weatherService = WeatherService.getInstance();