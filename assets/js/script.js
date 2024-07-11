// Your API key
const API_KEY = 'f7dad3ef020083a352dbd87ad912e66d';

// Base URLs for API calls
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast-cards');

// Function to fetch weather data
async function getWeatherData(city) {
    try {
        // First, get the coordinates
        const geoUrl = `${GEO_BASE_URL}?q=${city}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error(`HTTP error! status: ${geoResponse.status}`);
        }
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error('City not found');
        }

        const { lat, lon } = geoData[0];

        // Now fetch the weather data
        const forecastUrl = `${FORECAST_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const weatherResponse = await fetch(forecastUrl);
        if (!weatherResponse.ok) {
            throw new Error(`HTTP error! status: ${weatherResponse.status}`);
        }
        const weatherData = await weatherResponse.json();

        return weatherData;
    } catch (error) {
        console.error('Error in getWeatherData:', error);
        throw error;
    }
}

// Function to display current weather
function displayCurrentWeather(data) {
    const current = data.list[0];
    const cityName = data.city.name;
    const date = new Date(current.dt * 1000).toLocaleDateString();
    const iconUrl = `http://openweathermap.org/img/wn/${current.weather[0].icon}.png`;
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed;

    currentWeather.innerHTML = `
        <h2>${cityName}</h2>
        <p>${date}</p>
        <img src="${iconUrl}" alt="Weather icon">
        <p>Temperature: ${((temp * 9/5) + 32).toFixed(1)}°F</p> 
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed.toFixed(1)} m/s</p>
    `;
}

// Function to display 5-day forecast
function displayForecast(data) {
    forecast.innerHTML = '<h3>5-Day Forecast:</h3>';
    const dailyData = data.list.filter(reading => reading.dt_txt.includes('12:00:00'));
    
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();
        const iconUrl = `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
        const tempInCelsius = day.main.temp;
        const tempInFahrenheit = (tempInCelsius * 9/5) + 32;
        const humidity = day.main.humidity;
        const windSpeed = day.wind.speed;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <p>${date}</p>
            <img src="${iconUrl}" alt="Weather icon">
            <p>Temp: ${tempInFahrenheit.toFixed(1)}°F</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind: ${windSpeed.toFixed(1)} m/s</p>
        `;
        forecast.appendChild(forecastCard);
    });
}

// Function to add city to search history
function addToSearchHistory(city) {
    const searchItem = document.createElement('button');
    searchItem.textContent = city;
    searchItem.addEventListener('click', () => {
        cityInput.value = city;
        searchForm.dispatchEvent(new Event('submit'));
    });
    searchHistory.prepend(searchItem);

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history.slice(0, 5)));
    }
}

// Function to load search history from localStorage
function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    history.forEach(city => {
        const searchItem = document.createElement('button');
        searchItem.textContent = city;
        searchItem.addEventListener('click', () => {
            cityInput.value = city;
            searchForm.dispatchEvent(new Event('submit'));
        });
        searchHistory.appendChild(searchItem);
    });
}

// Event listener for form submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
            addToSearchHistory(city);
            cityInput.value = '';
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        }
    }
});

// Load search history on page load
loadSearchHistory();