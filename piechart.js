const reduceRace = data => {
    const number = {}
    data.forEach(crime => {
        const race = crime.race.toUpperCase()
        if (race in number) number[race]++
        else number[race] = 1    
    })
    
    return Object.keys(number).map(race => ({
        race, number: number[race]
    }))
}

var width = 600,
    height = 400,
    radius = Math.min(width, height) / 2;

var svg1 = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");



var color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.arc()
    .outerRadius(radius - 20)
    .innerRadius();

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.population; });


d3.csv("Mass-Shootings-1982-2020.csv")
.then(reduceRace)
.then(data => {
    
    console.log(data)
    console.log(pie(data))

    var g = svg1.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.data.age); });
});

