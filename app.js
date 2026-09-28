"use strict";

// Default location: Florida Atlantic University, Boca Raton, FL
const DEFAULT_LOCATION = {
  name: "Boca Raton, FL",
  latitude: 26.3683,
  longitude: -80.1289,
};

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_API = "https://geocoding-api.open-meteo.com/v1/search";

// WMO weather codes -> [emoji icon, short description]
const WEATHER_CODES = {
  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mainly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Depositing rime fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌧️", "Dense drizzle"],
  56: ["🌧️", "Freezing drizzle"],
  57: ["🌧️", "Dense freezing drizzle"],
  61: ["🌧️", "Slight rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain"],
  67: ["🌧️", "Heavy freezing rain"],
  71: ["🌨️", "Slight snow"],
  73: ["🌨️", "Snow"],
  75: ["❄️", "Heavy snow"],
  77: ["❄️", "Snow grains"],
  80: ["🌦️", "Slight rain showers"],
  81: ["🌧️", "Rain showers"],
  82: ["⛈️", "Violent rain showers"],
  85: ["🌨️", "Slight snow showers"],
  86: ["❄️", "Heavy snow showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm w/ hail"],
  99: ["⛈️", "Severe thunderstorm w/ hail"],
};

function weatherInfo(code) {
  return WEATHER_CODES[code] || ["🌡️", "Unknown"];
}

const el = (id) => document.getElementById(id);

function showStatus(message, isError = true) {
  const banner = el("status-banner");
  if (!message) {
    banner.hidden = true;
    banner.textContent = "";
    return;
  }
  banner.hidden = false;
  banner.textContent = message;
  banner.style.borderColor = isError ? "var(--fau-red)" : "var(--fau-blue)";
  banner.style.color = isError ? "var(--fau-red-dark)" : "var(--fau-blue)";
}

function formatTime(isoString, timezone) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
}

function formatHour(isoString, timezone) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    timeZone: timezone,
  });
}

function formatDay(isoDateString) {
  const date = new Date(`${isoDateString}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

async function geocodeCity(query) {
  const url = `${GEOCODE_API}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const data = await fetchJSON(url);
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${query}"`);
  }
  const result = data.results[0];
  const parts = [result.name, result.admin1, result.country_code].filter(Boolean);
  return {
    name: parts.join(", "),
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

async function fetchWeather({ latitude, longitude }) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    hourly: ["temperature_2m", "weather_code", "precipitation_probability"].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
    ].join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "7",
  });
  return fetchJSON(`${WEATHER_API}?${params.toString()}`);
}

function renderCurrent(locationName, data) {
  const { current, current_units: units, daily, timezone } = data;
  const [icon, description] = weatherInfo(current.weather_code);

  el("location-name").textContent = locationName;
  el("location-updated").textContent = `Updated ${formatTime(current.time, timezone)} local time`;
  el("current-icon").textContent = icon;
  el("current-temp").innerHTML = `${Math.round(current.temperature_2m)}&deg;${units.temperature_2m}`;
  el("current-desc").textContent = description;

  el("stat-feels").innerHTML = `${Math.round(current.apparent_temperature)}&deg;`;
  el("stat-humidity").textContent = `${Math.round(current.relative_humidity_2m)}%`;
  el("stat-wind").textContent = `${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}`;
  el("stat-precip").textContent = `${daily.precipitation_probability_max[0] ?? 0}%`;
  el("stat-sunrise").textContent = formatTime(daily.sunrise[0], timezone);
  el("stat-sunset").textContent = formatTime(daily.sunset[0], timezone);
}

function renderHourly(data) {
  const { hourly, timezone } = data;
  const container = el("hourly-scroll");
  container.innerHTML = "";

  const nowIndex = hourly.time.findIndex((t) => new Date(t) >= new Date());
  const startIndex = nowIndex === -1 ? 0 : nowIndex;
  const slice = hourly.time.slice(startIndex, startIndex + 24);

  slice.forEach((time, i) => {
    const idx = startIndex + i;
    const [icon] = weatherInfo(hourly.weather_code[idx]);
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <div class="hour-time">${i === 0 ? "Now" : formatHour(time, timezone)}</div>
      <div class="hour-icon">${icon}</div>
      <div class="hour-temp">${Math.round(hourly.temperature_2m[idx])}&deg;</div>
    `;
    container.appendChild(card);
  });
}

function renderDaily(data) {
  const { daily } = data;
  const container = el("daily-list");
  container.innerHTML = "";

  daily.time.forEach((date, idx) => {
    const [icon, description] = weatherInfo(daily.weather_code[idx]);
    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
      <span class="day-name">${idx === 0 ? "Today" : formatDay(date)}</span>
      <span class="day-desc">${description}</span>
      <span class="day-icon" aria-hidden="true">${icon}</span>
      <span class="day-temps">${Math.round(daily.temperature_2m_max[idx])}&deg;<span class="low">${Math.round(
      daily.temperature_2m_min[idx]
    )}&deg;</span></span>
    `;
    container.appendChild(row);
  });
}

async function loadWeatherFor(location) {
  showStatus(null);
  el("location-updated").textContent = "Loading current conditions…";
  try {
    const data = await fetchWeather(location);
    renderCurrent(location.name, data);
    renderHourly(data);
    renderDaily(data);
  } catch (err) {
    console.error(err);
    showStatus(`Couldn't load weather data: ${err.message}. Showing Boca Raton (FAU) as a fallback.`);
    if (location !== DEFAULT_LOCATION) {
      loadWeatherFor(DEFAULT_LOCATION);
    }
  }
}

function initSearch() {
  const form = el("search-form");
  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const query = el("search-input").value.trim();
    if (!query) return;
    showStatus(null);
    try {
      const location = await geocodeCity(query);
      await loadWeatherFor(location);
    } catch (err) {
      showStatus(err.message);
    }
  });
}

function initLocate() {
  el("locate-btn").addEventListener("click", () => {
    if (!navigator.geolocation) {
      showStatus("Geolocation isn't supported by this browser.");
      return;
    }
    showStatus("Locating you…", false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        showStatus(null);
        await loadWeatherFor({ name: "My Location", latitude, longitude });
      },
      () => {
        showStatus("Couldn't get your location. Showing Boca Raton (FAU) instead.");
      }
    );
  });
}

function init() {
  initSearch();
  initLocate();
  loadWeatherFor(DEFAULT_LOCATION);
}

document.addEventListener("DOMContentLoaded", init);
