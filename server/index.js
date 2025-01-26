const express = require('express');
const cors = require('cors');
const ipinfo = require('ipinfo-express');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize ipinfo with your token
const ipinfoMiddleware = ipinfo({
  token:'3c34c2f79e220f', // Replace with your actual IPinfo token
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

app.get('/', (req,res) => {
    res.send('Hello World');
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 