const DEV = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
const TILES_HOST = DEV ? "http://localhost:5500" : "https://resources.powerlines.one"

export const addSources = (map) => {
    // Add sources here
    map.addSource("pl", {
        type: "vector",
        url: `pmtiles://${TILES_HOST}/pl7.pmtiles`,
        attribution: "Карпачевский А. М., Титов Г. С."
    })
    map.addSource("modifications", {
        type: "vector",
        url: `pmtiles://${TILES_HOST}/modifications7.pmtiles`
    })
    map.addSource("points", {
        type: "vector",
        url: `pmtiles://${TILES_HOST}/points7.pmtiles`
    })
};