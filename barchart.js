const weaponData = data => {
    const weapons = {}
    data.forEach(({year,injured,weapons_obtained_legally}) => {
        if(weapons_obtained_legally in weapons){
            weapons[weapons_obtained_legally].number += +1


        } else if (weapons_obtained_legally.includes("Yes") )
        {weapons[weapons_obtained_legally]={
            number: 1,
            legal: "Yes"
        }
    } else if(weapons_obtained_legally.includes("No")){
        weapons[weapons_obtained_legally]={
            number: 1,
            legal: "No"

    }
}
    else{
        weapons[weapons_obtained_legally]={
            number: 1,
            legal: "TBD"

    }
}
    });
    final={}
    Object.values(weapons).forEach(({number,legal}) => {
        if(legal in final){
            final[legal].number += +number
        }else
        {final[legal]={
            number: number,
            legal: legal
        }}})





	return Object.values(final)
}

let myChart2 = document.getElementById('piechart').getContext('2d');
myChart2.font = '40px Oswald';
d3.csv('Mass-Shootings-1982-2020.csv')
    .then(weaponData)
    .then(data=>{
        const s = data.map(d=>d.number).reduce((a, b) => a + b, 0)

        let myChart2 = document.getElementById('piechart').getContext('2d');
        let pieChart = new Chart(myChart2,{
            type:'pie', //bar, pie, line ,horizontalBar
            data:{
                labels: ["Inconnu","Légale","Illégale"],
                datasets:[{
                    label:'Arme',
                    data: data.map(d=>Math.round(d.number/s*100)),
                    backgroundColor:["#DCDCDC","#C0D9D9","#216269"],

                    borderWidth:1,
                    borderColor:'#000',
                    hoverBorderWidth:3,
                    hoverBorderColor:"Black",
                }]



            },
            options:{
                title:{
                    display: true,
                    text:"Armes légales et illégales",
                    fontSize : 30,
                    fontFamilly:"Oswald",
                    fontColor:"Black"

                },
                legend:{
                    display:true,
                    position:'left',
                    labels:{
                        fontColor:"Black",
                        fontFamilly:"Oswald",
                    }
                },
                layout:{
                    padding:{
                        left:50,
                        right:0,
                        bottom:0,
                        top:0
                    }
                },
                tooltips:{
                    enabled:true,
                    callbacks:{
                        label: function(tooltipItem, data) {
                            var dataset = data.datasets[tooltipItem.datasetIndex]
                            var currentValue = dataset.data[tooltipItem.index];
                            return currentValue + "%";
                        }
                            
                    }
                }



            }
        });

    })
