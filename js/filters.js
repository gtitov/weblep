const MOSCOW = window.location.pathname === "/moscow.html/" || window.location.pathname === "/moscow.html"

export const getFilters = (yearValue) => ({
    yearFilter: [
        ["<=", ["get", "Year_start"], yearValue],
        [">", ["coalesce", ["get", "Year_end"], 3000], yearValue] // нет Year_end = линия не снесена
    ],
    yearNameFilter: [
        ["<=", ["get", "Year_start_name"], yearValue],
        [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue] // нет Year_end = линия не снесена
    ],
    moscowFilter: MOSCOW ? ["literal", true] : [">", ["get", "Voltage"], 110]
})