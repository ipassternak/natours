import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const displayMap = (locations) => {
  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: false,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://carto.com/">Carto</a>',
  }).addTo(map);
  const icon = L.icon({
    iconUrl: '../img/pin.png',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
  const bounds = L.latLngBounds();
  for (const location of locations) {
    const { coordinates } = location;
    coordinates.reverse();
    L.marker(coordinates, { icon }).addTo(map);
    L.popup({ closeOnClick: false, autoClose: false, offset: [0, -20] })
      .setLatLng(coordinates)
      .setContent(`<p>Day ${location.day}: ${location.description}</p>`)
      .openOn(map);
    bounds.extend(coordinates);
  }
  map.fitBounds(bounds.pad(0.4));
};
