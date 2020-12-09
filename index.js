
const extractData = data => {
    const states = {}
    data.forEach(crime => {
        const stateName = crime.city.match(/, (.*)$/)[1]
        const state = stateName === 'D.C.' ? 'District of Columbia' : stateName

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
            total: +crime.fatalities + +crime.injured
        }
    })

    const cities  = []
    data.forEach(crime => cities.push({
        name: crime.city,
        lat: +crime.latitude,
        lon : +crime.longitude,
        fatalities: crime.fatalities,
        injured: crime.injured,
        date: crime.date,
        total: +crime.fatalities + +crime.injured
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

const cityToTooltip = ({name, fatalities=0, injured=0, date}) => `
    <h6>${name}</h6>
    <table>
        <tbody>
            <tr>
                <td class="tooltip-info-label">Date</td>
                <td class="tooltip-info-value">${date}</td>    
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

//Create SVG element and append map to the SVG
const mapDiv = d3.select("#map")
const svg2 = mapDiv
    .append("svg")
    // .attr("width", width)
    // .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)

svg2.append("text")
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

//////////////////////////////////////////////////////////////////////////
d3.csv('Mass-Shootings-1982-2020.csv')
    .then(extractData)
    .then(([states,cities]) => d3
        .json("us-states.json")
        .then(geoJson => {

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


            update()
            update()
            $("#map-select").on("change", update)
            // add jQuery UI slider
            $("#date-slider").slider({
                range: true,
                max: parseTime("31/10/2017").getTime(),
                min: parseTime("12/5/2013").getTime(),
                step: 86400000, // one day
                values: [
                    parseTime("12/5/2013").getTime(),
                    parseTime("31/10/2017").getTime()
                ],
                slide: (event, ui) => {
                    $("#dateLabel1").text(formatTime(new Date(ui.values[0])))
                    $("#dateLabel2").text(formatTime(new Date(ui.values[1])))
                    update()
                }
            })

            function update(){
                const t = d3.transition().duration(1000)
                
                // filter data based on selections
                const choice = String($("#map-select").val())
                console.log(choice)
                

                
                const max = Math.max(...Object.values(states).map(state => state[choice]))
                const color = d3.scaleSqrt()
                    .domain([0, max])
                    // .domain([0, (1/2)*max, max])
                    .range(['#C6C6C6', '#074646'])
                    // .range(['#10A1AE', '#05636C', '#00262A'])



                // Bind the data to the SVG and create one path per GeoJSON feature
                var rect = svg2.selectAll("path.state")
                    .data(data);

                    


                    rect.enter()
                    .append("path")
                    .classed("state", true)
                    .attr("data-state", d => d.properties.name)
                    .attr("data-injured", d => d.properties.injured | 0)
                    .attr("data-fatalities", d => d.properties.fatalities| 0)
                    .attr("d", path)
                    .style("stroke", "#fff")
                    .style("stroke-width", "1")
                    .on("mouseover", () => tooltip.classed("opened", true))
                    .on("mouseout", () => tooltip.classed("opened", false))
                    .on("mousemove", ({properties}) => {
                        const [x, y] = d3.mouse(mapDiv.node())
                        tooltip
                            .style("top", (y + tooltipYOffset) + "px")
                            .style("left", (x + tooltipXOffset) + "px")
                            .html(stateToTooltip(properties))
                    });

                    rect.transition(t)
                    .style("fill", d => color(d.properties[choice]| 0));
                    
                   
                   
               
                
                var circle = svg2.selectAll("circle.city")
                .data(cities);

                

                
                circle.enter()
                    .append("circle")
                    .classed("city", true)
                    .attr("cx",d => projection([d.lon, d.lat])[0])
                    .attr("cy", d => projection([d.lon, d.lat])[1])
                    .on("mouseover", () => tooltip.classed("opened", true))
                    .on("mouseout", () => tooltip.classed("opened", false))
                    .on("mousemove", (d) => {
                        const [x, y] = d3.mouse(mapDiv.node())
                        tooltip
                            .style("top", (y + tooltipYOffset) + "px")
                            .style("left", (x + tooltipXOffset) + "px")
                            .html(cityToTooltip(d))
                    });
                    

                circle.transition(t)
                    .attr("r", d => Math.sqrt(d[choice]) * 4)
                    .style("fill", "rgb(217,91,67)")
                    

                

        

            }
     
    




        }
            )
    )