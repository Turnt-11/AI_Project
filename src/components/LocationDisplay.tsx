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
  });

  useEffect(() => {
    // Remove consent check and directly start tracking
    
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
    <div className="w-full mb-8">
      {/* Updated header with status indicator */}
      
  
      <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-white">Active Session</h2>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left text-blue-200 font-medium">GPS</th>
              <th className="p-4 text-left text-blue-200 font-medium">IP Address</th>
              <th className="p-4 text-left text-blue-200 font-medium">ISP</th>
              <th className="p-4 text-left text-blue-200 font-medium">City</th>
              <th className="p-4 text-left text-blue-200 font-medium">Region</th>
              <th className="p-4 text-left text-blue-200 font-medium">Country</th>
              <th className="p-4 text-left text-blue-200 font-medium">VPN</th>
              <th className="p-4 text-left text-blue-200 font-medium">Browser</th>
              <th className="p-4 text-left text-blue-200 font-medium">OS</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/10">
              <td className="p-4 text-white">
                {typeof location.latitude === 'number' && typeof location.longitude === 'number'
                  ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
                  : 'Unavailable'}
              </td>
              <td className="p-4 text-white">{location.ip}</td>
              <td className="p-4 text-white">{location.isp}</td>
              <td className="p-4 text-white">{location.city}</td>
              <td className="p-4 text-white">{location.region}</td>
              <td className="p-4 text-white">
                {location.country} {location.flag && <img src={location.flag} alt="Country flag" className="inline ml-2" />}
              </td>
              <td className="p-4 text-white">{location.isVpn ? 'Yes' : 'No'}</td>
              <td className="p-4 text-white">{location.browser}</td>
              <td className="p-4 text-white">{location.os}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 