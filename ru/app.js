const satellite_legend = "Спутник"
const osm_legend = "ОСМ"
const pl_voltage_legend = "Напряжение ЛЭП"
const pl_modifications_legend = "Изменения ЛЭП"
const pl_age_legend = "Возраст ЛЭП"
const endpoints_legend = "Станции и подстанции"
const el_centrality_legend = "el_centrality"
const pl_bc_legend = "pl_bc"
const ep_cc_legend = "ep_cc"
const wms_attribution = "&copy А. М. Карпачевский, Г. С. Титов"


const yearRange = document.getElementById("yearrange")
const yearLabel = document.getElementById("yearlabel")
yearLabel.innerText = yearRange.value
const isoYear = yearRange.value + "-01-01"

const map = L.map(
    'mapid',
    { zoomControl: false }
).setView([56.5, 37.09], 7);

L.DomEvent.on(L.DomUtil.get('zoom-in'), 'click', function () {
    map.setZoom(map.getZoom() + 1);
});

L.DomEvent.on(L.DomUtil.get('zoom-out'), 'click', function () {
    map.setZoom(map.getZoom() - 1);
});


const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaW93cTc1MCIsImEiOiJja3QwYzJpazMwN2ltMnVwOW0zbnJrOWh4In0.bBbrEq6D4MkMvX--IxJVUw")

// osm.addTo(map)
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
const pl_age = getWMSLayer("pl_age", isoYear)
const endpoints = getWMSLayer("endpoints_ru", isoYear).addTo(map)  // change because of labels
const el_centrality = getWMSLayer("el_centrality", isoYear)
const pl_bc = getWMSLayer("pl_bc", isoYear)
const ep_cc = getWMSLayer("ep_cc", isoYear)


const basemapControls = {
    [satellite_legend]: satellite,
    [osm_legend]: osm
}

const layersControls = {
    [pl_voltage_legend]: pl_voltage,
    [pl_modifications_legend]: pl_modifications,
    [pl_age_legend]: pl_age,
    [endpoints_legend]: endpoints,
    [el_centrality_legend]: el_centrality,
    [pl_bc_legend]: pl_bc,
    [ep_cc_legend]: ep_cc
}

L.control.layers(basemapControls, layersControls).addTo(map);








const updateYearLabel = function () {
    yearLabel.innerText = this.value
}

const updateYearValue = function () {
    const yearValue = this.value
    this.setAttribute("value", yearValue)
    const yearIso = yearValue + "-01-01"
    pl_voltage.setParams({ time: yearIso })
    pl_modifications.setParams({ time: yearIso })
    pl_age.setParams({ time: yearIso })
    endpoints.setParams({ time: yearIso })
    el_centrality.setParams({ time: yearIso })
    pl_bc.setParams({ time: yearIso })
    ep_cc.setParams({ time: yearIso })
    // other.setParams({time: yearIso})
}


yearRange.oninput = updateYearLabel
yearRange.onchange = updateYearValue

const legendToggle = document.getElementById("legend-toggle")
const legend = document.getElementById("legend")
legendToggle.addEventListener("click", () => legend.clientWidth ? legend.style.display = "none" : legend.style.display = "block")





