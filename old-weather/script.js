/**
* @fileoverview This script provides functions to fetch weather data from Open-Meteo API based on the city name.
*/

// Constants
/** @const {string} Base URL for the geocoding API */
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

/** @const {string} Base URL for the weather API */
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/gem";

/** @const {string} Parameters to fetch current weather details */
const CURRENT_PARAMETERS = "temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m";

/** @const {string} Unit for wind speed */
const WIND_SPEED_UNIT = "ms";

/**
* Fetches location data by city name.
* @param {string} cityName - The name of the city to search for.
*/
async function fetchLocationByCity(cityName) {
	if (cityName.length > 1) {
		const fullUrl = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(cityName)}&count=10`;
		let response = await fetch(fullUrl);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		return await response.json();
	}
}

/**
* Fetches weather data for a specific location.
* @param {string} city - The city name.
* @param {string} state - The state or region name.
* @param {number} latitude - The latitude of the location.
* @param {number} longitude - The longitude of the location.
*/
async function fetchWeatherForLocation(city, state, latitude, longitude) {
	try {
		const fullUrl = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=${CURRENT_PARAMETERS}&wind_speed_unit=${WIND_SPEED_UNIT}&timezone=auto`;
		let response = await fetch(fullUrl);
		if (!response.ok) {
			console.error(`HTTP error! status: ${response.status}`);
			alert("Error fetching weather data!");
			return;
		}
		let {
			current: {
				time,
				temperature_2m,
				is_day,
				weather_code,
				relative_humidity_2m,
				wind_speed_10m
			}
		} = await response.json();

		updateWeatherDisplay(
			time,
			city,
			state,
			temperature_2m,
			(temperature_2m * 9) / 5 + 32,
			!!parseInt(is_day), // boolean
			weather_code,
			relative_humidity_2m,
			wind_speed_10m
		);
	} catch (error) {
		console.error("Error fetching data:", error);
		alert("Error fetching weather data!");
	}
}

/**
* Formats a date string into a more readable format.
*
* @param {string} dateString - The date string to format. Expected in the format 'YYYY-MM-DDTHH:MM'.
* @returns {string} A formatted string representing the date in the format 'weekday, day month year' (e.g., "Friday, 15 December 2023").
*/
function formatDate(dateString) {
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};
	return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
* Updates the weather information display on the webpage.
* @param {string} date - Date.
* @param {string} city - The city name.
* @param {string} state - The state or region name.
* @param {number} tempInCelsius - The temperature in Celsius.
* @param {number} tempInFahrenheit - The temperature in Fahrenheit.
* @param {boolean} isDay - Indicates if it's currently day time.
* @param {number} weather_code - The weather condition code.
* @param {number} humidity - The humidity percentage.
* @param {number} wind - The wind speed in meters per second.
*/
function updateWeatherDisplay(date, city, state, tempInCelsius, tempInFahrenheit, isDay, weather_code, humidity, wind) {
	let {
		description,
		image
	} = getWmoCode(isDay, weather_code);
	document.getElementById("date").textContent = `${formatDate(date)}`;
	document.getElementById("location").textContent = `${city}, ${state}`;
	document.getElementById("tempInCelsius").textContent = `${tempInCelsius.toFixed(1)}`;
	document.getElementById("tempInFahrenheit").textContent = `${tempInFahrenheit.toFixed(1)}`;
	document.getElementById("condition").textContent = `${description}`;
	document.getElementById("conditionImg").src = `${image}`;
	document.getElementById("conditionImg").removeAttribute("hidden");
	document.getElementById("humidity").textContent = `${humidity}`;
	document.getElementById("wind").textContent = `${wind}`;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
	fetchWeatherForLocation("Calcutta", "West Bengal", 22.562633, 88.36302);
	const searchInput = document.getElementById("dropdownSearch");
	const dropdownList = document.getElementById("dropdownList");
	searchInput.focus();
	const locations = new Map();

	searchInput.addEventListener("input", async function () {
		const cityName = this.value;
		try {
			let {
				results
			} = await fetchLocationByCity(cityName);
			dropdownList.innerHTML = ""; // Clears current list
			dropdownList.style.display = "block"; // Shows the list

			if (results && results.length > 0) {
				results.forEach((item) => {
					const {
						id, name, admin1, latitude, longitude
					} = item;
					const div = document.createElement("div");
					div.id = id;
					div.style.fontSize = "16px";
					div.textContent = `${name}, ${admin1}`;
					dropdownList.appendChild(div);
					locations.set(`${id}`, {
						city: name, state: admin1, latitude: latitude, longitude: longitude
					});
				});
			} else {
				dropdownList.style.display = "none";
			}

			let currentIndex = -1;
			searchInput.addEventListener("keydown", function (event) {
				let itemCount = dropdownList.children.length;

				if (event.key === "ArrowDown") {
					if (currentIndex < itemCount - 1) {
						currentIndex++;
						highlightDropdownItem(currentIndex);
					}
				} else if (event.key === "ArrowUp") {
					if (currentIndex > 0) {
						currentIndex--;
						highlightDropdownItem(currentIndex);
					}
				} else if (event.key === "Enter") {
					if (currentIndex !== -1) {
						dropdownList.children[currentIndex].click();
					}
				}
			});

			function highlightDropdownItem(index) {
				Array.from(dropdownList.children).forEach((div, i) => {
					if (i === index) {
						div.classList.add("highlighted");
						div.scrollIntoView({
							block: "nearest"
						}); // Ensure the item is visible in the dropdown
					} else {
						div.classList.remove("highlighted");
					}
				});
			}

			dropdownList.addEventListener("click",
				async function (event) {
					let location = locations.get(event.target.id);
					await fetchWeatherForLocation(location.city, location.state, location.latitude, location.longitude);
					searchInput.value = "";
					locations.clear();
					searchInput.focus();
				});
		} catch (error) {
			console.error("Error fetching location data:",
				error);
		}
	});

	document.addEventListener("click", function (event) {
		if (event.target !== searchInput) {
			dropdownList.style.display = "none";
		}
	});
});

/**
* Returns the weather condition and image based on the provided code and day/night time.
* @param {boolean} isDay - Indicates if it's currently day time.
* @param {number} condition - The weather condition code.
* @return {Object} An object containing the description and image URL of the weather condition.
*/

function getWmoCode(isDay, condition) {
	const data = {
		0: {
			description: "Clear", image: "c01"
		},
		1: {
			description: "Mainly Clear", image: "c01"
		},
		2: {
			description: "Partly Cloudy", image: "c02"
		},
		3: {
			description: "Cloudy", image: "c03"
		},
		45: {
			description: "Foggy", image: "a05"
		},
		48: {
			description: "Rime Fog", image: "a05"
		},
		51: {
			description: "Light Drizzle", image: "d01"
		},
		53: {
			description: "Drizzle", image: "d02"
		},
		55: {
			description: "Heavy Drizzle", image: "d03"
		},
		56: {
			description: "Light Freezing Drizzle", image: "f01"
		},
		57: {
			description: "Freezing Drizzle", image: "f01"
		},
		61: {
			description: "Light Rain", image: "r01"
		},
		63: {
			description: "Rain", image: "r02"
		},
		65: {
			description: "Heavy Rain", image: "r03"
		},
		66: {
			description: "Light Freezing Rain", image: "f01"
		},
		67: {
			description: "Freezing Rain", image: "f01"
		},
		71: {
			description: "Light Snow", image: "s01"
		},
		73: {
			description: "Snow", image: "s02"
		},
		75: {
			description: "Heavy Snow", image: "s03"
		},
		77: {
			description: "Snow Grains", image: "s02"
		},
		80: {
			description: "Light Showers", image: "r04"
		},
		81: {
			description: "Showers", image: "r05"
		},
		82: {
			description: "Heavy Showers", image: "r06"
		},
		85: {
			description: "Light Snow Showers", image: "s01"
		},
		86: {
			description: "Snow Showers", image: "s01"
		},
		95: {
			description: "Thunderstorm", image: "t02"
		},
		96: {
			description: "Light Thunderstorms With Hail", image: "t01"
		},
		99: {
			description: "Thunderstorm With Hail", image: "t05"
		}
	}

	return data.hasOwnProperty(condition)
	? {
		description: `${data[condition].description}`,
		image: `https://cdn.weatherbit.io/static/img/icons/${data[condition].image}${isDay ? "d": "n"}.png`
	}: {
		description: "Not available"
	};
}
