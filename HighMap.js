const extractData = data => {
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

    return cities
}


d3.csv('Mass-Shootings-1982-2020.csv').then(extractData).then(dt =>{

    /// Initiate the chart
Highcharts.mapChart('map', {

    chart: {
        map: 'countries/us/us-all'
    },

    title: {
        text: 'US Mass Shootings'
    },

    mapNavigation: {
        enabled: true
    },

    tooltip: {
        headerFormat: '',
        pointFormat: '<b>{point.name}</b><br>fatalities: {point.fatalities}, injured: {point.injured}, date:{point.date}'
    },

    series: [{
        // Use the gb-all map with no data as a basemap
        name: 'Basemap',
        borderColor: '#A0A0A0',
        nullColor: 'rgba(200, 200, 200, 0.3)',
        showInLegend: false
    }, {
        name: 'Separators',
        type: 'mapline',
        nullColor: '#707070',
        showInLegend: false,
        enableMouseTracking: false
    }, {
        // Specify points using lat/lon
        type: 'mappoint',
        name: 'Mass Shootings',
        color: Highcharts.getOptions().colors[1],
        data: dt,
    }]
});

})


