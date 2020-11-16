const extractData = data => {
    const states = {}

    data.forEach(crime => {
        const state = crime.city.match(/, (.*)$/)[1]
        if (state in states) {
            states[state].crimes.push(crime)
            states[state].fatalities += +crime.fatalities
            states[state].injured += +crime.injured
        }
        else states[state] = {
            state,
            crimes: [crime],
            fatalities: +crime.fatalities,
            injured: +crime.injured
        }
    })

    return [states, data.columns]
}

const display = states => {
    //Width and height of map
    const width = 960
    const height = 500

    // D3 Projection
    const projection = d3.geo.albersUsa()
        .translate([width/2, height/2])    // translate to center of screen
        .scale([1000]);          // scale things down so see entire US

    // Define path generator
    const path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
        .projection(projection)  // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    // Append Div for tooltip to SVG
    const div = d3.select("#map")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)


}

d3.csv('Mass-Shootings-1982-2020.csv')
    .then(extractData)
    .then(([states]) => display(states))
