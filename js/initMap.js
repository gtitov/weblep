maplibregl.addProtocol("pmtiles", new pmtiles.Protocol().tile)
const MOSCOW = window.location.pathname === "/moscow.html/" || window.location.pathname === "/moscow.html"

const map = new maplibregl.Map({
    style: 'https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/positron-nolabels.json',
    center: MOSCOW ? [38.532, 55.477] : [90, 50],
    zoom: MOSCOW ? 7 : 2.5,
    maxZoom: 12,
    container: 'map',
    hash: true,
    maxBounds: MOSCOW ? [[28, 50], [48, 60]] : false
})

map.getCanvas().style.cursor = "crosshair"

// Смещение за открытый sidebar
map.setPadding({ left: 400 })

// disable map rotation using right click + drag
map.dragRotate.disable();

// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.ScaleControl(), 'bottom-right')

export default map