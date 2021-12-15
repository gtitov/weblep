const satellite_label = "Satellite"
const osm_label = "OSM"
const pl_voltage_label = "Voltage of power lines"
const pl_modifications_label = "Modifications of power lines"
const endpoints_label = "Plants & substations"
const wms_attribution = "&copy A. M. Karpachevskiy, G. S. Titov"


const yearRange = document.getElementById("yearrange")
const yearLabel = document.getElementById("yearlabel")
yearLabel.innerText = yearRange.value
const isoYear = yearRange.value + "-01-01"

const map = L.map(
    'mapid',
    {zoomControl: false}
).setView([56.5, 37.09], 7);

L.DomEvent.on(L.DomUtil.get('zoom-in'), 'click', function () {
    map.setZoom(map.getZoom() + 1);
});

L.DomEvent.on(L.DomUtil.get('zoom-out'), 'click', function () {
    map.setZoom(map.getZoom() - 1);
});


const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaW93cTc1MCIsImEiOiJja3QwYzJpazMwN2ltMnVwOW0zbnJrOWh4In0.bBbrEq6D4MkMvX--IxJVUw")


// OSM.addTo(map)
satellite.addTo(map)
const getWMSLayer = function (layerId, time) {
    return (
        L.tileLayer.wms('https://powerlines.one/wms?', {
            layers: layerId,
            transparent: true,
            format: 'image/png',
            time: time,
            attribution: wms_attribution
        })
    )
}
const pl_voltage = getWMSLayer("pl_voltage", isoYear).addTo(map)
const pl_modifications = getWMSLayer("pl_modifications", isoYear)
const endpoints = getWMSLayer("endpoints", isoYear).addTo(map)


const basemapControls = {
    [satellite_label]: satellite,
    [osm_label]: osm
}

const layersControls = {
    [pl_voltage_label]: pl_voltage,
    [pl_modifications_label]: pl_modifications,
    [endpoints_label]: endpoints
}

L.control.layers(basemapControls, layersControls).addTo(map);


const updateYearLabel = function () {
    yearLabel.innerText = this.value
}

const updateYearValue = function () {
    const yearValue = this.value
    this.setAttribute("value", yearValue)
    const yearIso = yearValue + "-01-01"
    pl_voltage.setParams({time: yearIso})
    pl_modifications.setParams({time: yearIso})
    endpoints.setParams({time: yearIso})
    // other.setParams({time: yearIso})
}


yearRange.oninput = updateYearLabel
yearRange.onchange = updateYearValue

const legendToggle = document.getElementById("legend-toggle")
const legend = document.getElementById("legend")
legendToggle.addEventListener("click", () => legend.clientWidth ? legend.style.display = "none" : legend.style.display = "block")





