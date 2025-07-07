 const apiKey = '3623abb43654de5022072f9aa8303d99';
let isCelsius = true;

// Éléments du DOM
const elements = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    unitToggle: document.getElementById('unit-toggle'),
    cityName: document.getElementById('city-name'),
    country: document.getElementById('country'),
    temp: document.getElementById('temp'),
    weatherIcon: document.getElementById('weather-icon'),
    description: document.getElementById('description'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    hourlyForecast: document.getElementById('hourly-forecast'),
    dailyForecast: document.getElementById('daily-forecast'),
    loader: document.querySelector('.loader')
};

// Fonction pour afficher le loader
function showLoader() {
    elements.loader.classList.remove('hidden');
}

function hideLoader() {
    elements.loader.classList.add('hidden');
}

// Fonction pour récupérer les données météo
async function getWeatherData(city) {
    showLoader();
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fr&appid=${apiKey}`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Ville non trouvée');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeatherData(currentData);
        displayHourlyForecast(forecastData.list.slice(0, 8));
        displayDailyForecast(forecastData.list);
    } catch (error) {
        alert(error.message);
        console.error('Erreur:', error);
    } finally {
        hideLoader();
    }
}

// Fonction pour récupérer par coordonnées
async function getWeatherByCoords(lat, lon) {
    showLoader();
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`)
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeatherData(currentData);
        displayHourlyForecast(forecastData.list.slice(0, 8));
        displayDailyForecast(forecastData.list);
    } catch (error) {
        alert('Erreur lors de la récupération des données');
        console.error(error);
    } finally {
        hideLoader();
    }
}

// Afficher les données météo
function displayWeatherData(data) {
    elements.cityName.textContent = data.name;
    elements.country.textContent = data.sys.country;
    elements.temp.textContent = `${Math.round(data.main.temp)}°C`;
    elements.description.textContent = data.weather[0].description;
    elements.humidity.textContent = data.main.humidity;
    elements.wind.textContent = Math.round(data.wind.speed * 3.6);
    elements.pressure.textContent = data.main.pressure;
    elements.visibility.textContent = (data.visibility / 1000).toFixed(1);
    
    const iconCode = data.weather[0].icon;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    elements.weatherIcon.alt = data.weather[0].description;
}

// Afficher les prévisions horaires
function displayHourlyForecast(hourlyData) {
    elements.hourlyForecast.innerHTML = '';
    
    hourlyData.forEach(hourData => {
        const hour = new Date(hourData.dt * 1000).getHours();
        const temp = Math.round(hourData.main.temp);
        const icon = hourData.weather[0].icon;
        
        const hourElement = document.createElement('div');
        hourElement.classList.add('hour-card');
        hourElement.innerHTML = `
            <p class="time">${hour}h</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${hourData.weather[0].description}">
            <p class="temp">${temp}°</p>
        `;
        
        elements.hourlyForecast.appendChild(hourElement);
    });
}

// Afficher les prévisions quotidiennes
function displayDailyForecast(dailyData) {
    elements.dailyForecast.innerHTML = '';
    
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const uniqueDays = [];
    
    // Filtrer pour avoir un jour par jour (tous les 8 éléments car l'API donne des données toutes les 3 heures)
    for (let i = 0; i < dailyData.length; i += 8) {
        uniqueDays.push(dailyData[i]);
    }
    
    uniqueDays.forEach(dayData => {
        const date = new Date(dayData.dt * 1000);
        const dayName = days[date.getDay()];
        const tempMax = Math.round(dayData.main.temp_max);
        const tempMin = Math.round(dayData.main.temp_min);
        const icon = dayData.weather[0].icon;
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('day-card');
        dayElement.innerHTML = `
            <p class="day">${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${dayData.weather[0].description}">
            <p class="temp-max">${tempMax}°</p>
            <p class="temp-min">${tempMin}°</p>
        `;
        
        elements.dailyForecast.appendChild(dayElement);
    });
}

// Basculer entre °C et °F
function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    const currentTemp = elements.temp.textContent;
    const tempValue = parseInt(currentTemp);
    
    if (isCelsius) {
        elements.temp.textContent = `${Math.round((tempValue - 32) * 5/9)}°C`;
    } else {
        elements.temp.textContent = `${Math.round(tempValue * 9/5 + 32)}°F`;
    }
}

// Événements
elements.searchBtn.addEventListener('click', () => {
    const city = elements.cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        alert('Veuillez entrer une ville');
    }
});

elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = elements.cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

elements.locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => alert('Impossible d\'obtenir votre localisation.')
        );
    } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
});

elements.unitToggle.addEventListener('click', toggleTemperatureUnit);

// Chargement initial
getWeatherData('Paris');