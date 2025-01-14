const API_KEY = `530215aa3ce099ba8174dc5a8fa2ef9c`;
const searchFormEl = document.getElementById(`search-form`);
const cityInputEl = document.getElementById(`city-input`);
const weatherCardContainerEl = document.getElementById(`card-container`);
const todayWeatherContainerEl = document.getElementById(`card-container-today`);
const fiveDayWeatherContainerEl = document.getElementById(`card-container-five-day`);
const savedCitiesEl = document.getElementById(`saved-cities`);
const clearBtnEl = document.getElementById(`clear-button`);

let cities = JSON.parse(localStorage.getItem(`cities`)) || [];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function saveCity(city) {
  localStorage.setItem(`cities`, JSON.stringify(city));
}

function createCityButton(cityName) {
  let cityButton = document.createElement(`button`);
  cityButton.textContent = cityName;
  cityButton.classList = `city-button d-block p-1 mb-3 w-100 btn btn-secondary`;
  cityButton.setAttribute(`type`, `button`);
  savedCitiesEl.appendChild(cityButton);

  cityButton.addEventListener('click', () => {
    clearWeatherCards();
    fetchWeatherInfo(cityName);
  });
}

function createWeatherCards(cityData) {
  let cityName = cityData.city.name;

  todayWeatherContainerEl.innerHTML = '';
  fiveDayWeatherContainerEl.innerHTML = '';

  // Create today's card
  let todayData = cityData.list[0];
  let todayTemp = todayData.main.temp;
  let todayHumidity = todayData.main.humidity;
  let todayWind = todayData.wind.speed;
  let todayIcon = todayData.weather[0].icon.slice(0, 2);
  let todayCard = createWeatherCard(cityName, 'Today', todayTemp, todayHumidity, todayWind, todayIcon);
  todayWeatherContainerEl.appendChild(todayCard);

  // Create 5-day forecast cards
  let fiveDayTitle = document.createElement('h3');
  fiveDayTitle.textContent = '5 Day Forecast:';
  fiveDayTitle.classList = 'p-3 mt-5 text-center text-black';
  fiveDayWeatherContainerEl.appendChild(fiveDayTitle);

  let forecastContainer = document.createElement('div');
  forecastContainer.classList = 'd-flex justify-content-between';

  for (let i = 1; i <= 5; i++) {
    let dayData = cityData.list[i * 8 - 3];
    let dateFormatted = dayjs.unix(dayData.dt).format('ddd, MMM D');
    let temp = dayData.main.temp;
    let humidity = dayData.main.humidity;
    let wind = dayData.wind.speed;
    let icon = dayData.weather[0].icon.slice(0, 2);
    let forecastCard = createWeatherCard(cityName, dateFormatted, temp, humidity, wind, icon);
    forecastContainer.appendChild(forecastCard);
  }

  fiveDayWeatherContainerEl.appendChild(forecastContainer);
}

function createWeatherCard(cityName, date, temp, humidity, wind, icon) {
  let card = document.createElement('div');
  card.classList = 'card w-75 m-2';

  let cardHeader = document.createElement('div');
  cardHeader.textContent = `${cityName} - ${date}`;
  cardHeader.classList = 'card-header';
  card.appendChild(cardHeader);

  let weatherIcon = document.createElement('img');
  let iconURL = `https://openweathermap.org/img/wn/${icon}d@2x.png`;
  weatherIcon.setAttribute('src', iconURL);
  weatherIcon.classList = 'mx-auto';
  card.appendChild(weatherIcon);

  let detailsList = document.createElement('ul');
  detailsList.classList = 'list-group list-group-flush';
  card.appendChild(detailsList);

  let tempItem = document.createElement('li');
  tempItem.textContent = `Temperature: ${temp}°C`;
  tempItem.classList = 'list-group-item';
  detailsList.appendChild(tempItem);

  let windItem = document.createElement('li');
  windItem.textContent = `Wind: ${wind} KPH`;
  windItem.classList = 'list-group-item';
  detailsList.appendChild(windItem);

  let humidityItem = document.createElement('li');
  humidityItem.textContent = `Humidity: ${humidity}%`;
  humidityItem.classList = 'list-group-item';
  detailsList.appendChild(humidityItem);

  return card;
}

function fetchWeatherInfo(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (!cities.includes(data.city.name)) {
        cities.push(data.city.name);
        saveCity(cities);
        createCityButton(data.city.name);
      }
      createWeatherCards(data);
    })
    .catch(error => {
      alert(error.message);
    });
}

function clearWeatherCards() {
  todayWeatherContainerEl.innerHTML = '';
  fiveDayWeatherContainerEl.innerHTML = '';
}

function clearLocalStorage() {
  cities = [];
  saveCity(cities);
  location.reload();
}

// Document ready function using vanilla JavaScript
document.addEventListener('DOMContentLoaded', function() {
  if (cities.length > 0) {
    cities.forEach(city => {
      createCityButton(city);
    });
  }

  searchFormEl.addEventListener('submit', function(event) {
    event.preventDefault();

    let city = cityInputEl.value.trim();
    if (city) {
      city = capitalizeFirstLetter(city);
      cityInputEl.value = '';
      clearWeatherCards();
      fetchWeatherInfo(city);
    } else {
      alert('Please enter a city');
    }
  });

  clearBtnEl.addEventListener('click', clearLocalStorage);
});