const extractData = data => {
    const states = {}
    
    data.forEach(crime => {
        const stateName = crime.city.match(/, (.*)$/)[1]
        const state = stateName === 'D.C.' ? 'District of Columbia' : stateName

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
    
    const cities  = []
    data.forEach(crime => {
        
        cities.push(
            {
                name: crime.city,
                lat: +crime.latitude,
                lon : +crime.longitude,
                fatalities: crime.fatalities,
                injured: crime.injured,
                date: crime.date
            }
        )
        })
    console.log(cities)
    return [states,cities]
}

    


const display = (states, geoJson,cities) => {
    //Width and height of map
    const width = 940
    const height = 600

    // D3 Projection
    const projection = d3.geoAlbersUsa()
        .translate([width/2, height/2])    // translate to center of screen
        .scale([1000]);          // scale things down so see entire US

    // Define path generator
    const path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
        .projection(projection)  // tell path generator to use albersUsa projection

    // Define linear scale for output
    const max = Math.max(...Object.values(states).map(state => state.injured))
    const color = d3.scalePow()
        // .domain([0, max])
        .domain([0, (1/20)*max, max])
        // .range(['#10A1AE', '#00262A'])
        .range(['#10A1AE', '#05636C', '#00262A'])

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

    const geoStates = geoJson.features.map(value => value.properties.name)
    Object.keys(states)
        .filter(state => !geoStates.includes(state))
        .sort()
        .forEach(state => console.warn(`"${state}" is not in the geoJSON`))

    // Add our properties to the geo json
    const data = geoJson.features.map(value => {
        if (value.properties.name in states) return {
            ...value,
            properties: {
                ...states[value.properties.name],
                ...value.properties
            }
        }
        else return value
    })

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path.state")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("data-state", d => d.properties.name)
        .attr("data-injured", d => d.properties.injured | 0)
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .style("fill", d => color(d.properties.injured | 0))
    console.log(data)

    dt = cities
    svg.selectAll("circle")
    .data(dt)
    .enter()
    .append("circle")
    .attr("cx",function(d) {
		return projection([d.lon, d.lat])[0];
	})
    .attr("cy", function(d) {
		return projection([d.lon, d.lat])[1];
	})
	.attr("r", function(d) {
		return Math.sqrt(d.fatalities) * 4;
    })
	.style("fill", "rgb(217,91,67)")	
	.style("opacity", 0.85)



}

d3.csv('Mass-Shootings-1982-2020.csv')
    .then(extractData)
    .then(([states,cities]) => d3
        .json("us-states.json")
        .then(geoJson => display(states, geoJson,cities))
    )
