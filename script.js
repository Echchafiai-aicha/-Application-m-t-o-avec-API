// Clé API - Inscrivez-vous sur OpenWeatherMap pour obtenir une clé gratuite
const apiKey = '3623abb43654de5022072f9aa8303d99'; // Remplacez par votre clé API

// Éléments du DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const country = document.getElementById('country');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weather-icon');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

// Fonction pour récupérer les données météo
async function getWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Ville non trouvée');
        }
        
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        alert(error.message);
        console.error('Erreur:', error);
    }
}

// Fonction pour afficher les données météo
function displayWeatherData(data) {
    cityName.textContent = data.name;
    country.textContent = data.sys.country;
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    wind.textContent = Math.round(data.wind.speed * 3.6); // Conversion m/s en km/h
    
    // Icône météo
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

// Événement de clic sur le bouton de recherche
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        alert('Veuillez entrer une ville');
    }
});

// Événement pour la touche Entrée
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            alert('Veuillez entrer une ville');
        }
    }
});
// Après la fonction getWeatherData, ajoutez :

async function getHourlyForecast(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fr&appid=${apiKey}`
    );
    const data = await response.json();
    displayHourlyForecast(data.list);
}

function displayHourlyForecast(hourlyData) {
    const hourlyContainer = document.getElementById('hourly-forecast');
    hourlyContainer.innerHTML = '';
    
    // On prend les 12 prochaines heures (toutes les 3 heures sur 36h)
    for (let i = 0; i < 5; i++) {
        const hourData = hourlyData[i];
        const hour = new Date(hourData.dt * 1000).getHours();
        const temp = Math.round(hourData.main.temp);
        const icon = hourData.weather[0].icon;
        
        const hourElement = document.createElement('div');
        hourElement.classList.add('hour-card');
        hourElement.innerHTML = `
            <p class="time">${hour}h</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${hourData.weather[0].description}">
            <p class="temp">${temp}°C</p>
        `;
        
        hourlyContainer.appendChild(hourElement);
    }
}

async function getDailyForecast(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=5&units=metric&lang=fr&appid=${apiKey}`
    );
    const data = await response.json();
    displayDailyForecast(data.list);
}

function displayDailyForecast(dailyData) {
    const daysContainer = document.getElementById('daily-forecast');
    daysContainer.innerHTML = '';
    
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    dailyData.forEach(dayData => {
        const date = new Date(dayData.dt * 1000);
        const dayName = days[date.getDay()];
        const tempMax = Math.round(dayData.temp.max);
        const tempMin = Math.round(dayData.temp.min);
        const icon = dayData.weather[0].icon;
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('day-card');
        dayElement.innerHTML = `
            <p class="day">${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${dayData.weather[0].description}">
            <p class="temp-max">${tempMax}°C</p>
            <p class="temp-min">${tempMin}°C</p>
            <p class="temp-range">${tempMin}° / ${tempMax}°</p>
        `;
        
        daysContainer.appendChild(dayElement);
    });
}

// Modifiez votre fonction getWeatherData pour appeler ces nouvelles fonctions
async function getWeatherData(city) {
    try {
        // Météo actuelle
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`
        );
        const currentData = await currentResponse.json();
        displayWeatherData(currentData);
        
        // Prévisions
        await getHourlyForecast(city);
        await getDailyForecast(city);
    } catch (error) {
        alert(error.message);
        console.error('Erreur:', error);
    }
}

// Chargement initial (optionnel)
getWeatherData('Paris'); // Affiche Paris par défaut au chargement