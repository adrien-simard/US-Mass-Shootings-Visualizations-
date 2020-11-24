

const extractData2 = data => {
    const years = {}
    data.forEach(({year,injured,fatalities}) => {
        if(year in years){
            years[year].injured += +injured
			years[year].fatalities += +fatalities
			years[year].total += Number(injured)+Number(fatalities)

        }else years[year]={
            injured:+injured,
			fatalities:+fatalities,
			total: Number(injured)+Number(fatalities),
            year,
        }
    });

	return Object.values(years)
}
const MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

  svg.append("text")
	.attr("x", (WIDTH / 2))             
	.attr("y", 100- (MARGIN.TOP / 2))
	.attr("text-anchor", "middle")  
	.style("font-size", "20px")
	.style("font-familly", "arial")
	.text("Victimes des Tueries");


const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)


// for tooltip
const bisectDate = d3.bisector(d => d.year).left

// add the line for the first time
g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")

	const yLabel = g.append("text")
	.attr("class", "y axisLabel")
	.attr("transform", "rotate(-90)")
	.attr("y", -60)
	.attr("x", -130)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	

// axis labels
const xLabel = g.append("text")
	.attr("class", "x axisLabel")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Year")

	
const format= d3.format("")
// scales
const x = d3.scaleLinear().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(4)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")

d3.csv("Mass-Shootings-1982-2020.csv").then(extractData2).then(data => {
	console.log('object :>> ', data);


	// run the visualization for the first time
	update()
	$("#coin-select").on("change", update)
	
	

function update() {
	const t = d3.transition().duration(1000)
	console.log("test")
	// filter data based on selections
	const choice = String($("#coin-select").val())
	
	
	yLabel.transition(t).text(choice)

	// update scales
	x.domain(d3.extent(data, d => d.year))
	y.domain([
		d3.min(data, d => d[choice]), 
		d3.max(data, d => d[choice])
	])

	
	

	// update axes
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall.tickFormat(d=>format(d)))
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall.tickFormat(d=>d))

	// clear old tooltips
	d3.select(".focus").remove()
	d3.select(".overlay").remove()

	/******************************** Tooltip Code ********************************/

	const focus = g.append("g")
		.attr("class", "focus")
		.style("display", "none")



	focus.append("circle")
		.attr("r", 4)

	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em")

	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)

	function mousemove() {
		const x0 = x.invert(d3.mouse(this)[0])
		const i = bisectDate(data, x0, 1)
		const d0 = data[i - 1]
		const d1 = data[i]
		const d = x0 - d0.year > d1.year - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.year)}, ${y(d[choice])})`)
		focus.select("text").text(d[choice])
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[choice]))
		focus.select(".y-hover-line").attr("x2", -x(d.year))
	}
	
	/******************************** Tooltip Code ********************************/

	// Path generator
	line = d3.line()
		.x(d => x(d.year))
		.y(d => y(d[choice]))

	// Update our line path
	g.select(".line")
		.transition(t)
		.attr("d", line(data))
	
}
})

