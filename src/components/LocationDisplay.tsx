import { useState, useEffect } from 'react';

export default function LocationDisplay() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    city: '',
    region: '',
    country: '',
    flag: '',
    ip: '',
    isp: '',
    macAddress: '',
    isVpn: false,
    browser: '',
    os: '',
    screenResolution: '',
    consentGiven: false,
  });

  useEffect(() => {
    // Check for user consent
    const consent = localStorage.getItem('userConsent');
    if (!consent) {
      alert('We use cookies and other data to enhance your experience. By using our site, you agree to our privacy policy.');
      localStorage.setItem('userConsent', 'true');
    }
    setLocation((prev) => ({ ...prev, consentGiven: true }));

    // Get GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error('Error getting GPS location:', error.message);
          setLocation((prev) => ({
            ...prev,
            latitude: 'Unavailable',
            longitude: 'Unavailable',
          }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocation((prev) => ({
        ...prev,
        latitude: 'Unavailable',
        longitude: 'Unavailable',
      }));
    }

    // Fetch data from the Express server
    fetch('http://localhost:3000/api/user-info')
      .then((response) => response.json())
      .then((data) => {
        setLocation((prev) => ({
          ...prev,
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country,
          isp: data.isp,
          macAddress: data.macAddress,
          isVpn: data.isVpn,
          flag: data.country ? `https://flagcdn.com/32x24/${data.country.toLowerCase()}.png` : '',
        }));
      })
      .catch((error) => {
        console.error('Error fetching user info:', error.message);
      });

    // Get device information
    const deviceInfo = {
      browser: navigator.userAgent,
      os: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
    setLocation((prev) => ({ ...prev, ...deviceInfo }));
  }, []);

  return (
    <div>
      {location.consentGiven && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>GPS</th>
              <th style={styles.th}>IP Address</th>
              <th style={styles.th}>ISP</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>Region</th>
              <th style={styles.th}>Country</th>
              <th style={styles.th}>VPN</th>
              <th style={styles.th}>Browser</th>
              <th style={styles.th}>OS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>
                {typeof location.latitude === 'number' && typeof location.longitude === 'number'
                  ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
                  : 'Unavailable'}
              </td>
              <td style={styles.td}>{location.ip}</td>
              <td style={styles.td}>{location.isp}</td>
              <td style={styles.td}>{location.city}</td>
              <td style={styles.td}>{location.region}</td>
              <td style={styles.td}>
                {location.country} {location.flag && <img src={location.flag} alt="Country flag" />}
              </td>
              <td style={styles.td}>{location.isVpn ? 'Yes' : 'No'}</td>
              <td style={styles.td}>{location.browser}</td>
              <td style={styles.td}>{location.os}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  table: {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '8px',
    padding: '10px',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '8px',
    borderBottom: '1px solid #444',
    textAlign: 'left',
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #444',
  },
}; 