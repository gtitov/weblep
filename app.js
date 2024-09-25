document.addEventListener("DOMContentLoaded", function () {
  const lang = document.documentElement.lang;

  const translate = {
    PL_voltage: {
      ru: "Напряжение ЛЭП",
      en: "Voltage of power lines",
    },
    PL_modifications: {
      ru: "Изменения ЛЭП",
      en: "Modifications of power lines",
    },
    PL_age: {
      ru: "Возраст ЛЭП",
      en: "Age of power lines",
    },
    kV: {
      ru: "кВ",
      en: "kV",
    },
    year: {
      ru: "год",
      en: "year",
    },
    branches_to: {
      ru: "Отпайки на пункты:",
      en: "Branches to:",
    },
    doubt_year: {
      ru: "Сомнения в годе",
      en: "doubt_year",
    },
    doubt_geometry: {
      ru: "Сомнения в геометрии",
      en: "Doubt in geometry",
    },
  };

  const vectorLayers = [
    "lines_voltage",
    "lines_age",
    "substations",
    "generation",
  ];

  const map = new maplibregl.Map({
    container: "mapid", // container id
    // DOCS: https://maplibre.org/maplibre-gl-js-docs/style-spec/
    style: "lep.json",
    center: [87.625, 55.751], // starting position [lng, lat]
    zoom: 2.8, // starting zoom,
    maxZoom: 11,
  });

  map.on("load", function () {
    const squareImage = new Image();
    squareImage.src = "./white-square.png";
    squareImage.onload = () => map.addImage("white-square", squareImage);
    map.setLayoutProperty("generation", "icon-image", "white-square");

    // Initial year select
    document.getElementById("yearlabel").innerText =
      document.getElementById("yearrange").value;

    // Toggles
    const legendToggle = document.getElementById("legend-toggle");
    const legend = document.getElementById("legend");

    const layersToggle = document.getElementById("layers-toggle");
    const layers = document.getElementById("layers-panel");

    const diagramToggle = document.getElementById("diagram-toggle");
    const diagram = document.getElementById("diagram");

    legendToggle.addEventListener("click", () =>
      legend.clientWidth
        ? (legend.style.display = "none")
        : ((legend.style.display = "block"),
          (layers.style.display = "none"),
          (diagram.style.display = "none"))
    );
    layersToggle.addEventListener("click", () =>
      layers.clientWidth
        ? (layers.style.display = "none")
        : ((legend.style.display = "none"),
          (layers.style.display = "block"),
          (diagram.style.display = "none"))
    );
    diagramToggle.addEventListener("click", () =>
      diagram.clientWidth
        ? (diagram.style.display = "none")
        : ((legend.style.display = "none"),
          (layers.style.display = "none"),
          (diagram.style.display = "block"))
    );

    // Basemaps

    const greyBasemap = document.getElementById("basemap-grey");
    const satelliteBasemap = document.getElementById("basemap-satellite");

    greyBasemap.addEventListener("click", () => {
      greyBasemap.classList.add("active");
      satelliteBasemap.classList.remove("active");
      map.setLayoutProperty("mono-layer", "visibility", "visible");
      map.setLayoutProperty("satellite-layer", "visibility", "none");
    });

    satelliteBasemap.addEventListener("click", () => {
      satelliteBasemap.classList.add("active");
      greyBasemap.classList.remove("active");
      map.setLayoutProperty("satellite-layer", "visibility", "visible");
      map.setLayoutProperty("mono-layer", "visibility", "none");
    });

    // Layers

    vectorLayers.map((l) =>
      document.getElementById(l).addEventListener("click", (event) => {
        map.setLayoutProperty(
          l,
          "visibility",
          event.target.checked ? "visible" : "none"
        );
      })
    );

    // Zoom control
    document
      .getElementById("zoom-in")
      .addEventListener("click", () => map.zoomIn());
    document
      .getElementById("zoom-out")
      .addEventListener("click", () => map.zoomOut());

    // Range control
    const updateYearFilter = (year) => {
      ["lines_voltage", "lines_age"].map((l) =>
        map.setFilter(l, [
          "all",
          [">=", year, ["get", "Year_start_name"]],
          ["<=", year, ["coalesce", ["get", "Year_end_name"], 3000]],
        ])
      );
      ["generation", "substations"].map((l) =>
        map.setFilter(l, [
          "all",
          [">=", year, ["get", "Year_start"]],
          ["<", year, ["coalesce", ["get", "Year_end"], 3000]],
        ])
      );
      map.setPaintProperty("lines_age", "line-color", [
        "step",
        ["-", year, ["get", "Year_start"]],
        "#FDE725",
        2,
        "#C2E023",
        5,
        "#85D44A",
        10,
        "#5EC874",
        15,
        "#2BB07E",
        20,
        "#85D44A",
        30,
        "#25858E",
        40,
        "#2D6F8E",
        50,
        "#38588C",
        60,
        "#423E85",
        70,
        "#482173",
        80,
        "#541763",
      ]);
    };

    const yearrange = document.getElementById("yearrange");

    updateYearFilter(parseInt(yearrange.value));

    yearrange.addEventListener("change", () => {
      const yearValue = parseInt(yearrange.value);
      document.getElementById("yearlabel").innerText = yearValue;
      updateYearFilter(yearValue);
    });

    const changeEvent = new Event("change");
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    let pause
    const play = async () => {
      pause = false
      document.getElementById("playyears").style.display = "none"
      document.getElementById("pauseyears").style.display = "block"
      yearrange.disabled = true
      for (let i = yearrange.value; i < 2021; i++) {
        if (pause) {
          break
        }
        yearrange.value = i;
        yearrange.dispatchEvent(changeEvent);
        await timer(500); // then the created Promise can be awaited
      }
      yearrange.disabled = false
      document.getElementById("playyears").style.display = "block"
      document.getElementById("pauseyears").style.display = "none"
    };
    document.getElementById("playyears").addEventListener("click", play);

    document.getElementById("pauseyears").addEventListener("click", () => pause = true);

    // Hover
    vectorLayers.map((l) => {
      map.on("mouseenter", l, function () {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", l, function () {
        map.getCanvas().style.cursor = "";
      });
    });

    // Click
    map.on("click", function (e) {
      const feature = map.queryRenderedFeatures(e.point)[0];
      if (feature === undefined) {
        return;
      }
      let popup_content;
      console.log(feature);
      if (["generation", "substations"].includes(feature.layer.id)) {
        popup_content =
          lang == "ru"
            ? `<div>
                        <b>${feature.properties.Type} ${
                feature.properties.Name
              }${
                feature.properties.Alternative_name
                  ? " (" + feature.properties.Alternative_name + ") "
                  : ""
              } ${
                feature.properties.Number ? feature.properties.Number : ""
              }</b>
                        <p>${
                          feature.properties.Voltage
                            ? "<p>" +
                              feature.properties.Voltage +
                              ` ${translate.kV[lang]}</p>`
                            : ""
                        }
                        <p>${feature.properties.Year_start} ${
                translate.year[lang]
              }</p>
                    </div>`
            : `<div>
                        <b>${feature.properties.Type} ${
                feature.properties.Name_en
              }${
                feature.properties.Alternative_name
                  ? " (" + feature.properties.Alternative_name + ") "
                  : ""
              } ${
                feature.properties.Number ? feature.properties.Number : ""
              }</b>
                        <p>${
                          feature.properties.Voltage
                            ? "<p>" +
                              feature.properties.Voltage +
                              ` ${translate.kV[lang]}</p>`
                            : ""
                        }
                        <p>${feature.properties.Year_start_name} ${
                translate.year[lang]
              }</p>
                    </div>`;
      } else if (["lines_voltage", "lines_age"].includes(feature.layer.id)) {
        popup_content =
          lang == "ru"
            ? `<div>
                        <b>${feature.properties.Name}</b>
                        ${
                          feature.properties.Branch_points
                            ? `<p>${translate.branches_to[lang]} ` +
                              feature.properties.Branch_points +
                              "</p>"
                            : ""
                        }
                        <p>${feature.properties.Year_start} ${
                translate.year[lang]
              }</p>
                        ${
                          feature.properties.Doubt_Year
                            ? `<i>${translate.doubt_year[lang]}</i>`
                            : ""
                        }
                        ${
                          feature.properties.Doubt_geometry
                            ? `<i>${translate.doubt_geometry[lang]}</i>`
                            : ""
                        }
                    </div>`
            : `<div>
                        <b>${feature.properties.Name}</b>
                        ${
                          feature.properties.Branch_points
                            ? `<p>${translate.branches_to[lang]} ` +
                              feature.properties.Branch_points +
                              "</p>"
                            : ""
                        }
                        <p>${feature.properties.Year_start} ${
                translate.year[lang]
              }</p>
                        ${
                          feature.properties.Doubt_Year
                            ? `<i>${translate.doubt_year[lang]}</i>`
                            : ""
                        }
                        ${
                          feature.properties.Doubt_geometry
                            ? `<i>${translate.doubt_geometry[lang]}</i>`
                            : ""
                        }
                    </div>`;
      } else if (feature.layer.id == "PL_modifications") {
        popup_content =
          lang == "ru"
            ? `<div>
                        <b>${feature.properties.Name}</b>
                        ${
                          feature.properties.Segment_Type
                            ? "<p>" + feature.properties.Segment_Type + "</p>"
                            : ""
                        }
                    </div>`
            : `<div>
                        <b>${feature.properties.Name}</b>
                        ${
                          feature.properties.Segment_Type
                            ? "<p>" + feature.properties.Segment_Type + "</p>"
                            : ""
                        }
                    </div>`;
      }
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popup_content)
        .addTo(map);
    });

    // Diagram

    // const ctx = document.getElementById("diagram-canvas");
    // const regions_selector = document.getElementById("select-region");

    // fetch("/diagram_voltage_regions_ru.json")
    //   .then((r) => r.json())
    //   .then((j) => {
    //     j.map(
    //       (e) =>
    //         (regions_selector.innerHTML += `<option value="${e.region}">${e.region}</option>`)
    //     );
    //     let chart = new Chart(
    //       ctx,
    //       j.find((e) => e.region == "РФ")
    //     );
    //     regions_selector.onchange = function () {
    //       const clickedRegion = this.value;
    //       // console.log(clickedRegion);
    //       chart.destroy();
    //       chart = new Chart(
    //         ctx,
    //         j.find((e) => e.region == clickedRegion)
    //       );
    //     };
    //   });
  });
});
