document.addEventListener("DOMContentLoaded", function () {
    const raster_layers = [
        {
            id: "mono-layer",
            title: "Mono"
        },
        {
            id: "satellite-layer",
            title: "Satellite"
        }
    ]
    const vector_layers = [
        {
            id: "PL_voltage",
            title: "Voltage of power lines"
        },
        {
            id: "PL_modifications",
            title: "Modifications of power lines"
        },
        {
            id: "PL_age",
            title: "Age of power lines"
        },
        {
            id: "Endpoints",
            title: "Plants & substations"
        }
    ]

    const map = new maplibregl.Map({
        container: 'mapid', // container id
        // DOCS: https://maplibre.org/maplibre-gl-js-docs/style-spec/
        style: "lep.json",
        center: [37.625, 55.751], // starting position [lng, lat]
        zoom: 5, // starting zoom,
        minZoom: 4,
        maxZoom: 11
    });

    map.on("load", function () {
        // Initial year select
        document.getElementById("yearlabel").innerText = document.getElementById("yearrange").value



        // Toggles
        const legendToggle = document.getElementById("legend-toggle")
        const legend = document.getElementById("legend")

        const layersToggle = document.getElementById("layers-toggle")
        const layers = document.getElementById("layers")

        const diagramToggle = document.getElementById("diagram-toggle")
        const diagram = document.getElementById("diagram")

        legendToggle.addEventListener("click", () => legend.clientWidth ? legend.style.display = "none" : (legend.style.display = "block", layers.style.display = "none", diagram.style.display = "none"))
        layersToggle.addEventListener("click", () => layers.clientWidth ? layers.style.display = "none" : (legend.style.display = "none", layers.style.display = "block", diagram.style.display = "none"))
        diagramToggle.addEventListener("click", () => diagram.clientWidth ? diagram.style.display = "none" : (legend.style.display = "none", layers.style.display = "none", diagram.style.display = "block"))



        // Layers

        const basemaps_part = document.createElement("div")
        basemaps_part.className = "form-group"

        const basemaps_title = document.createElement("label")
        basemaps_title.className = "form-label"
        basemaps_title.textContent = "Basemaps"

        basemaps_part.appendChild(basemaps_title)

        raster_layers.forEach(function (rl) {
            const label = document.createElement("label")
            label.className = "form-checkbox"

            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkbox.name = "basemaps"
            checkbox.value = rl.id
            checkbox.checked = rl.id == "mono-layer" ? true : false
            checkbox.onchange = function () {
                const clickedLayer = this.value

                const visibility = map.getLayoutProperty(
                    clickedLayer,
                    'visibility'
                );

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === 'visible') {
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                } else {
                    map.setLayoutProperty(
                        clickedLayer,
                        'visibility',
                        'visible'
                    );
                }
            }
            label.appendChild(checkbox)

            const i = document.createElement("i")
            i.className = "form-icon"
            label.appendChild(i)

            label.append(rl.title)

            basemaps_part.appendChild(label)
        })
        document.getElementById("layers").appendChild(basemaps_part)


        const layers_part = document.createElement("div")
        layers_part.className = "form-group"

        const layers_title = document.createElement("label")
        layers_title.className = "form-label"
        layers_title.textContent = "Layers"

        layers_part.appendChild(layers_title)

        vector_layers.forEach(function (vl) {
            const label = document.createElement("label")
            label.className = "form-checkbox"

            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkbox.name = "layers"
            checkbox.value = vl.id
            checkbox.checked = vl.id == "PL_voltage" | vl.id == "Endpoints" ? true : false
            checkbox.onchange = function () {
                const clickedLayer = this.value

                const visibility = map.getLayoutProperty(
                    clickedLayer,
                    'visibility'
                );

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === 'visible') {
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                } else {
                    map.setLayoutProperty(
                        clickedLayer,
                        'visibility',
                        'visible'
                    );
                }
            }
            label.appendChild(checkbox)

            const i = document.createElement("i")
            i.className = "form-icon"
            label.appendChild(i)

            label.append(vl.title)

            layers_part.appendChild(label)
        })
        document.getElementById("layers").appendChild(layers_part)



        // Zoom control
        document.getElementById("zoom-in").addEventListener("click", () => map.zoomIn())
        document.getElementById("zoom-out").addEventListener("click", () => map.zoomOut())



        // Range control
        const updateYearFilter = (year) => {
            vector_layers.forEach(vector_layer => {
                map.setFilter(vector_layer.id, ["==", ["get", "year"], year])
            })
        }

        updateYearFilter(parseInt(document.getElementById("yearrange").value))

        document.getElementById("yearrange").addEventListener("change", () => {
            const yearValue = parseInt(document.getElementById("yearrange").value)
            document.getElementById("yearlabel").innerText = yearValue
            updateYearFilter(yearValue)
        })



        // Hover
        vector_layers.forEach(function (vl) {
            map.on("mouseenter", vl.id, function () {
                map.getCanvas().style.cursor = 'pointer'
            })
            map.on("mouseleave", vl.id, function () {
                map.getCanvas().style.cursor = '';
            })
        })



        // Click
        map.on("click", function (e) {
            const feature = map.queryRenderedFeatures(e.point)[0]
            if (feature === undefined) {
                return
            }
            let popup_content
            console.log(feature)
            if (feature.layer.id == "Endpoints") {
                popup_content = `<div>
                    <b>${feature.properties.Type} ${feature.properties.Name_en}${feature.properties.Alternative_name ? " (" + feature.properties.Alternative_name + ") " : ""} ${feature.properties.Number ? feature.properties.Number : ""}</b>
                    <p>${feature.properties.Voltage ? "<p>" + feature.properties.Voltage + " kV</p>" : ""}
                    <p>${feature.properties.Year_start_name} year</p>
                </div>`
            } else if (["PL_voltage", "PL_age"].includes(feature.layer.id)) {
                popup_content = `<div>
                    <b>${feature.properties.Name}</b>
                    ${feature.properties.Branch_points ? "<p>Branches to: " + feature.properties.Branch_points + "</p>" : ""}
                    <p>${feature.properties.Year_start} year</p>
                    ${feature.properties.Doubt_Year ? "<i>Doubt in year</i>" : ""}
                    ${feature.properties.Doubt_geometry ? "<i>Doubt in geometry</i>" : ""}
                </div>`
            } else if (feature.layer.id == "PL_modifications") {
                popup_content = `<div>
                    <b>${feature.properties.Name}</b>
                    ${feature.properties.Segment_Type ? "<p>" + feature.properties.Segment_Type + "</p>" : ""}
                </div>`
            }
            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popup_content)
                .addTo(map);
        })


        // Diagram

        const ctx = document.getElementById('diagram-canvas');

        fetch("/diagram_voltage_ru.json")
            .then(r => r.json())
            .then(j => new Chart(ctx, j))
        // 

    })
})







