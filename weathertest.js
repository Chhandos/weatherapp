const axios = require("axios");

const API_KEY = "fa89e48d900c4968a1e31153240107";
const city = "Delhi"; // change to test other cities

async function getWeather() {
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`;
    const response = await axios.get(url);
    
    console.log("✅ Weather API Working!");
    console.log("City:", response.data.location.name);
    console.log("Temperature (°C):", response.data.current.temp_c);
    console.log("Condition:", response.data.current.condition.text);
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

getWeather();
