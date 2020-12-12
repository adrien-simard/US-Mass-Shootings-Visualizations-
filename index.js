(() => {
    const normalizeCrime = crime => ({
        ...crime,
        fatalities: +crime.fatalities,
        injured: +crime.injured,
        total_victims: +crime.total_victims,
        date: parseTime(crime.date),
    })

    const extractData = data => {
        const states = {}
        data.forEach(row => {
            const stateName = row.city.match(/, (.*)$/)[1]
            const state = stateName === 'D.C.' ? 'District of Columbia' : stateName
            const crime = normalizeCrime(row)

            if (state in states) {
                states[state].crimes.push(crime)
                states[state].fatalities += +crime.fatalities
                states[state].injured += +crime.injured
                states[state].total += +crime.injured + +crime.fatalities
            }
            else states[state] = {
                state,
                crimes: [crime],
                fatalities: +crime.fatalities,
                injured: +crime.injured,
                total: +crime.fatalities + +crime.injured,

            }
        })

        const cities  = []
        data.forEach(crime => cities.push({
            ...crime,
            name: crime.city,
            date: parseTime(crime.date),
            total: +crime.fatalities + +crime.injured,
            year: crime.year,
            gender: crime.gender
        }))

        return [states,cities]
    }

    const stateToTooltip = ({name, fatalities=0, injured=0, crimes=[]}) => `
        <h6>${name}</h6>
        <table>
            <tbody>
                <tr>
                    <td class="tooltip-info-label">Nombre de crimes</td>
                    <td class="tooltip-info-value">${crimes.length}</td>                
                </tr>
                <tr>            
                    <td class="tooltip-info-label">Blessés</td>
                    <td class="tooltip-info-value">${injured}</td>                
                </tr>
                <tr>            
                    <td class="tooltip-info-label">Morts</td>
                    <td class="tooltip-info-value">${fatalities}</td>                
                </tr>
            </tbody>
        </table>
    `

    const cityToTooltip = ({name, fatalities=0, injured=0, year,gender}) => `
        <h6>${name}</h6>
        <table>
            <tbody>
                <tr>
                    <td class="tooltip-info-label">Date</td>
                    <td class="tooltip-info-value">${year}</td>    
                </tr>
                <tr>            
                    <td class="tooltip-info-label">Blessés</td>
                    <td class="tooltip-info-value">${injured}</td>                
                </tr>
                <tr>            
                    <td class="tooltip-info-label">Morts</td>
                    <td class="tooltip-info-value">${fatalities}</td>                
                </tr>
                <tr>            
                    <td class="tooltip-info-label">Genre</td>
                    <td class="tooltip-info-value">${gender}</td>                
                </tr>
            </tbody>
        </table>
    `
    //////////////////////////////////////////////////////////////////////////
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

    // our transition
    const transition = d3.transition().duration(500)

    //Create SVG element and append map to the SVG
    const mapDiv = d3.select("#map")
    const svg = mapDiv
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`) // responsive svg

    const statesGroup = svg.append('g').classed('states', true)
    const citiesGroup = svg.append('g').classed('cities', true)

    svg.append("text")
        .attr('class', 'title')
        .attr("x", (width / 3))
        .attr("y", 50- (20/ 2))
        .attr("text-anchor", "middle")
        .text("Répartition des Crimes aux USA");

    // Append Div for tooltip to SVG
    const tooltipXOffset = 20
    const tooltipYOffset = 10
    const tooltip = mapDiv
        .append("div")
        .attr("class", "tooltip")

        var legendText = ["+100","0"];

        var legend = d3.select("#map").append("svg")
                        .attr('transform', 'translate(600, -180)')
                         .attr("width", 100)
                        .attr("height", 100)

        legend.append("circle").attr("cx",10).attr("cy",10).attr("r", 10).style("fill", "rgb(217,91,67)")
        legend.append("text").attr("x", 22).attr("y", 15).text("Crimes")
        .style("font-size", "12px")

        legend.append("rect").attr("x", 2)
        .attr("y", 25)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "#074646");
        legend.append("rect").attr("x", 2)
        .attr("y", 40)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "#226765");
        legend.append("rect").attr("x", 2)
        .attr("y", 55)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "rgb(98,131,131)");
        legend.append("rect").attr("x", 2)
        .attr("y", 70)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", '#C6C6C6')

        legend.append("text").attr("x", 20)
        .attr("y", 30)
        .text("+100")
        .style("font-size", "12px")

        legend.append("text").attr("x", 20)
        .attr("y", 85)
        .text("0")
        .style("font-size", "12px")

    const parseTime = d3.timeParse("%m/%d/%Y")
    const formatTime = d3.timeFormat("%m/%d/%Y")

    const createGeoJson = states => geoJson => {
        const geoStates = geoJson.features.map(value => value.properties.name)
        Object.keys(states)
            .filter(state => !geoStates.includes(state))
            .sort()
            .forEach(state => console.warn(`"${state}" is not in the geoJSON`))

        // Add our properties to the geo json
        return data = geoJson.features.map(value => {
            if (value.properties.name in states) return {
                ...value,
                properties: {
                    ...states[value.properties.name],
                    ...value.properties
                }
            }
            else return value
        })
    }

    const sum = (a, b) => a + b

    const display = (cities, geoJson) => {
        const draw = drawChart(cities, geoJson)
        $select = $("#map-select")
        $slider = $("#date-slider")

        const update = () => {
            const choice = String($select.val())
            const [minYear, maxYear] = $slider.slider("values")

            geoJson.forEach(({properties}) => {
                if (properties.crimes) {
                    const crimes = properties.crimes.filter(v => v.date >= minYear && v.date <= maxYear)
                    properties.fatalities = crimes.map(crime => crime.fatalities).reduce(sum, 0)
                    properties.injured = crimes.map(crime => crime.injured).reduce(sum, 0)
                    properties.total = crimes.map(crime => crime.total_victims).reduce(sum, 0)
                }
            })

            draw(choice, minYear, maxYear)
        }

        $select.on("change", update)
        // add jQuery UI slider
        $slider.slider({
            range: true,
            max: parseTime("12/10/2020").getTime(),
            min: parseTime("01/01/1982").getTime(),
            step: 31557600000, // one month
            values: [
                parseTime("01/01/1982").getTime(),
                parseTime("12/10/2020").getTime()
            ],
            change: update,
            slide: (event, ui) => {
                $("#dateLabel1").text(formatTime(new Date(ui.values[0])))
                $("#dateLabel2").text(formatTime(new Date(ui.values[1])))
            },
        })

        statesGroup.selectAll("path.state")
            .data(geoJson)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "white")
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .classed("state", true)
            .on("mouseover", () => tooltip.classed("opened", true))
            .on("mouseout", () => tooltip.classed("opened", false))
            .on("mousemove", ({properties}) => {
                const [x, y] = d3.mouse(mapDiv.node())
                tooltip
                    .style("top", (y + tooltipYOffset) + "px")
                    .style("left", (x + tooltipXOffset) + "px")
                    .html(stateToTooltip(properties))
            })

        citiesGroup.selectAll("circle.city")
            .data(cities)
            .enter()
            .append("circle")
            .classed("city", true)
            .attr("data-city", d => d.name)
            .attr("cx",d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("r", 0)
            .style("fill", d => d.gender.toLowerCase().includes('f') ? "rgb(112,112,210)" : "rgb(217,91,67)")
            .on("mouseover", () => tooltip.classed("opened", true))
            .on("mouseout", () => tooltip.classed("opened", false))
            .on("mousemove", (d) => {
                const [x, y] = d3.mouse(mapDiv.node())
                tooltip
                    .style("top", (y + tooltipYOffset) + "px")
                    .style("left", (x + tooltipXOffset) + "px")
                    .html(cityToTooltip(d))
            })


        update()
    }

    const drawChart = (cities, geoJson) => (choice, minYear, maxYear) => {
        const values = geoJson.map(state => state.properties[choice]).filter(v => v !== undefined)
        const max = Math.max.apply(Math, values)
        const color = d3.scaleSqrt()
            .domain([0, max])
            // .domain([0, (1/2)*max, max])
            .range(['#C6C6C6', '#074646'])
        // .range(['#10A1AE', '#05636C', '#00262A'])

        // Bind the geoJson to the SVG and create one path per GeoJSON feature
        statesGroup.selectAll("path.state")
            .data(geoJson)
            .attr("data-state", d => d.properties.name)
            .attr("data-injured", d => d.properties.injured | 0)
            .attr("data-fatalities", d => d.properties.fatalities| 0)
            .transition(transition)
            .style("fill", d => color(d.properties[choice]| 0))

        citiesGroup.selectAll("circle.city")
            .data(cities)
            .transition(transition)
            .attr("r", d => d.date >= minYear && d.date <= maxYear ? Math.sqrt(d[choice]) * 4 : 0)
    }

    //////////////////////////////////////////////////////////////////////////
    d3.csv('Mass-Shootings-1982-2020.csv')
        .then(extractData)
        .then(([states,cities]) => d3
            .json("us-states.json")
            .then(createGeoJson(states))
            .then(geoJson => display(cities, geoJson)))
})()
