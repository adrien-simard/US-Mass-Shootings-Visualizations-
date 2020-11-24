const extractAge = data => {
    const ages = {}
    data.forEach(({fatalities,injured,age_of_shooter}) => {
        if(age_of_shooter in ages){
            ages[age_of_shooter].injured += +injured
			ages[age_of_shooter].fatalities += +fatalities
            ages[age_of_shooter].total += Number(injured)+Number(fatalities)
            ages[age_of_shooter].crime +=1

        }else{
            if(Number(age_of_shooter)<18){
                ages[age_of_shooter]={
                    injured:+injured,
                    fatalities:+fatalities,
                    total: Number(injured)+Number(fatalities),
                    age_of_shooter:"-18",
                    crime: 1
            }
            
        }
       
        else if(Number(age_of_shooter)<25 && Number(age_of_shooter)>18){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"18-25",
                crime: 1}
            }
        else if(Number(age_of_shooter)<=30 && Number(age_of_shooter)>25){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"25-30",
                crime: 1}
            }
                
        else if(Number(age_of_shooter)>30 && Number(age_of_shooter)<35){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"30-35",
                crime: 1}
            }

        else if(Number(age_of_shooter)>35 && Number(age_of_shooter)<40){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"35-40",
                crime: 1}
            }

        else if(Number(age_of_shooter)>=40 && Number(age_of_shooter)<35){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"35-40",
                crime: 1}

        }
        else if(Number(age_of_shooter)>=45 && Number(age_of_shooter)<50){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"45-50",
                crime: 1}

        }else if(Number(age_of_shooter)>=50 && Number(age_of_shooter)<55){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"50-55",
                crime: 1}
        }else if(Number(age_of_shooter)>=55 && Number(age_of_shooter)<60){
                ages[age_of_shooter]={
                    injured:+injured,
                    fatalities:+fatalities,
                    total: Number(injured)+Number(fatalities),
                    age_of_shooter:"55-60",
                    crime: 1}

        }else if(Number(age_of_shooter)>=60 && Number(age_of_shooter)<65){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"60-65",
                crime: 1}

        }else if(Number(age_of_shooter)>=65){
            ages[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:"+65",
                crime: 1}

        }
    

    }});
    fin={}
    Object.values(ages).forEach(({fatalities,injured,age_of_shooter,crime})=>{
        if(age_of_shooter in fin){
            fin[age_of_shooter].injured += +injured
			fin[age_of_shooter].fatalities += +fatalities
            fin[age_of_shooter].total += Number(injured)+Number(fatalities)
            fin[age_of_shooter].crime +=crime

        }else{
            fin[age_of_shooter]={
                injured:+injured,
                fatalities:+fatalities,
                total: Number(injured)+Number(fatalities),
                age_of_shooter:age_of_shooter,
                crime: crime}

        }

    })


	return Object.values(fin)
}


d3.csv('Mass-Shootings-1982-2020.csv')
    .then(extractAge)
    .then(data=>{
        console.log("age",data)

        
        const svgContainer = d3.select('#agechart');
        const svg = svgContainer.select('svg');
       
        
        const margin = 80;
        const width = 700 - 2 * margin;
        const height = 500 - 2 * margin;
    
        const chart = svg.append('g')
          .attr('transform', `translate(${margin}, ${margin})`);
    
        const xScale = d3.scaleBand()
          .range([0, width])
          .domain(data.map((s) => s.age_of_shooter))
          .padding(0.3)
        
        const yScale = d3.scaleLinear()
          .range([height, 0])
          .domain([0, 22]);
    
        // vertical grid lines
        // const makeXLines = () => d3.axisBottom()
        //   .scale(xScale)
    
        const makeYLines = () => d3.axisLeft()
          .scale(yScale)
    
        chart.append('g')
          .attr('transform', `translate(0, ${height})`)
          .call(d3.axisBottom(xScale));
    
        chart.append('g')
          .call(d3.axisLeft(yScale));
    
        // vertical grid lines
        // chart.append('g')
        //   .attr('class', 'grid')
        //   .attr('transform', `translate(0, ${height})`)
        //   .call(makeXLines()
        //     .tickSize(-height, 0, 0)
        //     .tickFormat('')
        //   )
    
        chart.append('g')
          .attr('class', 'grid')
          .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat('')
          )
    
        const barGroups = chart.selectAll()
          .data(data)
          .enter()
          .append('g')
    
        barGroups
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (g) => xScale(g.age_of_shooter))
          .attr('y', (g) => yScale(g.crime))
          .attr('height', (g) => height - yScale(g.crime))
          .attr('width', xScale.bandwidth())
          .on('mouseenter', function (actual, i) {
            d3.selectAll('.crime')
              .attr('opacity', 0)
    
            d3.select(this)
              .transition()
              .duration(300)
              .attr('opacity', 0.6)
              .attr('x', (a) => xScale(a.age_of_shooter) - 5)
              .attr('width', xScale.bandwidth() + 10)
    
            const y = yScale(actual.crime)
    
            line = chart.append('line')
              .attr('id', 'limit')
              .attr('x1', 0)
              .attr('y1', y)
              .attr('x2', width)
              .attr('y2', y)
    
            barGroups.append('text')
              .attr('class', 'divergence')
              .attr('x', (a) => xScale(a.age_of_shooter) + xScale.bandwidth() / 2)
              .attr('y', (a) => yScale(a.crime) + 30)
              .attr('fill', 'white')
              .attr('text-anchor', 'middle')
              .text((a, idx) => {
                const divergence = (a.crime - actual.crime).toFixed(1)
                
                let text = ''
                if (divergence > 0) text += '+'
                text += `${divergence}`
    
                return idx !== i ? text : '';
              })
    
          })
          .on('mouseleave', function () {
            d3.selectAll('.crime')
              .attr('opacity', 1)
    
            d3.select(this)
              .transition()
              .duration(300)
              .attr('opacity', 1)
              .attr('x', (a) => xScale(a.age_of_shooter))
              .attr('width', xScale.bandwidth())
    
            chart.selectAll('#limit').remove()
            chart.selectAll('.divergence').remove()
          })
    
        barGroups 
          .append('text')
          .attr('class', 'crime')
          .attr('x', (a) => xScale(a.age_of_shooter) + xScale.bandwidth() / 2)
          .attr('y', (a) => yScale(a.crime) + 30)
          .attr('text-anchor', 'middle')
          .text((a) => `${a.crime}`)
        
        svg
          .append('text')
          .attr('class', 'label')
          .attr('x', -(height / 2) - margin)
          .attr('y', margin / 2.4)
          .attr('transform', 'rotate(-90)')
          .attr('text-anchor', 'middle')
          .text('Nombre Crimes')
    
        svg.append('text')
          .attr('class', 'label')
          .attr('x', width / 2 + margin)
          .attr('y', height + margin * 1.7)
          .attr('text-anchor', 'middle')
          .text('Ages')
    
        svg.append('text')
          .attr('class', 'title')
          .attr('x', width / 2 + margin)
          .attr('y', 40)
          .attr('text-anchor', 'middle')
          .text("Nombres de crimes par tanche d'age")
    
       
    })