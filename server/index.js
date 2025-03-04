const express = require('express');
const cors = require('cors');
const ipinfo = require('ipinfo-express');
const winston = require('winston');
const { scrapeRealEstate } = require('./real-estate-scraper'); // Import the scraper

const app = express();
const port = 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize ipinfo with your token
const ipinfoMiddleware = ipinfo({
  token: '3c34c2f79e220f', // Replace with your actual IPinfo token
});

// Endpoint to get user data
app.get('/api/user-info', ipinfoMiddleware, (req, res) => {
  const { ip, city, region, country, org } = req.ipinfo;
  // Placeholder for MAC address and VPN detection logic
  const macAddress = 'Unavailable'; // MAC address cannot be fetched directly
  const isVpn = false; // Placeholder for VPN detection logic

  res.json({
    ip,
    city,
    region,
    country,
    isp: org,
    macAddress,
    isVpn,
  });
});

// New endpoint for real estate data
app.get('/api/real-estate', async (req, res) => {
  try {
    const listings = await scrapeRealEstate();
    res.json(listings);
  } catch (error) {
    logger.error('Real estate scraping error:', error);
    res.status(500).json({ error: 'Failed to fetch real estate data' });
  }
});

app.get('/', (req, res) => {
  
  res.json({ message: 'Hello World' });
});

// Example login endpoint with logging
// app.post('/login', (req, res) => {
//   const { email } = req.body;
//   // Assume login logic here
//   const loginSuccess = false; // Example outcome

//   if (!loginSuccess) {
//     logger.info(`Failed login attempt for email: ${email}`);
//   }

//   res.sendStatus(200);
// });



// Start the server and initial scraping
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 