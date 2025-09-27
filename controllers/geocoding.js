async function geocodeAddress(address) {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Manama App' // Required by Nominatim's terms
      }
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } else {
      return null;
    }
  } catch (error) {
    req.flash('failure', `Geocoding error:${error} `);
    return null;
  }
}
module.exports = geocodeAddress;