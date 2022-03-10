L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

    onAdd: function (map) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfo, this);
    },

    onRemove: function (map) {
        // Triggered when the layer is removed from a map.
        //   Unregister a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfo, this);
    },

    getFeatureInfo: function (evt) {
        const url = this.getFeatureInfoUrl(evt.latlng)
        const showResults = L.Util.bind(this.showGetFeatureInfo, this)
        fetch(url)
            .then(response => response.json())
            .then(data => showResults(evt.latlng, data))
    },

    getFeatureInfoUrl: function (latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
            size = this._map.getSize(),

            params = {
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                styles: this.wmsParams.styles,
                transparent: this.wmsParams.transparent,
                version: this.wmsParams.version,
                format: this.wmsParams.format,
                bbox: this._map.getBounds().toBBoxString(),
                height: size.y,
                width: size.x,
                layers: this.wmsParams.layers,
                query_layers: this.wmsParams.layers,
                info_format: 'application/json',
                time: this.wmsParams.time
            };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return this._url + L.Util.getParamString(params, this._url, true);
    },

    showGetFeatureInfo: function (latlng, response) {
        console.log(response)
        console.log(this.wmsParams)
        // Otherwise show the content in a popup, or something.
        if(!response.features.length) return
        const content = `<p>${response.features[0].properties.Name_en}</p>`
        L.popup({
            maxWidth: 800
        })
            .setLatLng(latlng)
            .setContent(content)
            .openOn(this._map);
    }
});

L.tileLayer.betterWms = function (url, options) {
    return new L.TileLayer.BetterWMS(url, options);
};

const satellite_legend = "Satellite"
const osm_legend = "OSM"
const pl_voltage_legend = "Voltage of power lines"
const pl_modifications_legend = "Modifications of power lines"
const pl_age_legend = "Age of power lines"
const endpoints_legend = "Plants & substations"
const wms_attribution = "&copy A. M. Karpachevskiy, G. S. Titov"


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
        L.tileLayer.wms('http://93.180.19.45/powerlines/wms', {  // change to "L.tileLayer.betterWms('https://powerlines.one/wms', {" to try betterWMS
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
const endpoints = getWMSLayer("endpoints", isoYear).addTo(map)


const basemapControls = {
    [satellite_legend]: satellite,
    [osm_legend]: osm
}

const layersControls = {
    [pl_voltage_legend]: pl_voltage,
    [pl_modifications_legend]: pl_modifications,
    [pl_age_legend]: pl_age,
    [endpoints_legend]: endpoints
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
    // other.setParams({time: yearIso})
}


yearRange.oninput = updateYearLabel
yearRange.onchange = updateYearValue

const legendToggle = document.getElementById("legend-toggle")
const legend = document.getElementById("legend")
legendToggle.addEventListener("click", () => legend.clientWidth ? legend.style.display = "none" : legend.style.display = "block")





