const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Coloca aquí tu clave de API real de WeatherAPI.com (se subirá a Git)
const WEATHER_API_KEY = "918194e388c44b24ac5192041262106";

// Middlewares
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Helper function to generate mock weather data
function getMockWeather(locationName) {
    const cleanName = locationName.trim();
    const hash = Array.from(cleanName).reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Predictable but varied temperature between 15°C and 35°C
    const temp_c = 15 + (hash % 21);

    const conditions = ["Clear", "Partly cloudy", "Sunny", "Overcast", "Patchy rain nearby"];
    const condition = conditions[hash % conditions.length];

    return {
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase(),
        temp_c: parseFloat(temp_c.toFixed(1)),
        condition: condition,
        isMock: true
    };
}

// Function to fetch weather from external API or fallback to mock
async function fetchWeather(location) {
    if (!WEATHER_API_KEY || WEATHER_API_KEY.trim() === "" || WEATHER_API_KEY === "TU_WEATHER_API_KEY_AQUI") {
        return getMockWeather(location);
    }

    try {
        const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=no`;

        // We use standard fetch API (supported natively in Node.js 18+)
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `WeatherAPI status ${response.status}`);
        }

        const data = await response.json();
        return {
            name: data.location.name,
            country: data.location.country,
            temp_c: data.current.temp_c,
            condition: data.current.condition.text,
            isMock: false
        };
    } catch (error) {
        console.warn(`[Warning] Error fetching real weather for "${location}" (falling back to mock data):`, error.message);
        return getMockWeather(location);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: "UP",
        service: "weather-microservice",
        timestamp: new Date().toISOString(),
        weatherSource: (WEATHER_API_KEY && WEATHER_API_KEY !== "TU_WEATHER_API_KEY_AQUI") ? "WeatherAPI" : "Mock Fallback (No API Key)"
    });
});

// Weather endpoint
app.get('/api/weather', async (req, res, next) => {
    try {
        const { country } = req.query;

        if (!country) {
            return res.status(400).json({
                error: "Missing parameter",
                message: "You must provide a 'country' or 'city' query parameter. Example: /api/weather?country=Spain"
            });
        }

        console.log(`Processing weather request for requested country: "${country}" and "Nicaragua"`);

        // Fetch both in parallel
        const [requestedCountryWeather, nicaraguaWeather] = await Promise.all([
            fetchWeather(country),
            fetchWeather('Nicaragua')
        ]);

        res.json({
            requestedCountry: requestedCountryWeather,
            nicaragua: nicaraguaWeather
        });
    } catch (error) {
        next(error);
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message || "An unexpected error occurred."
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Weather Microservice started on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/weather?country=Spain`);
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "TU_WEATHER_API_KEY_AQUI") {
        console.log(` Mode: Using MOCK weather data (Configure WEATHER_API_KEY in server.js to use real API)`);
    } else {
        console.log(` Mode: Using real WeatherAPI data`);
    }
    console.log(`==================================================`);
});
