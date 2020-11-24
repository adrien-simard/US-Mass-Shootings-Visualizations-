const weaponData = data => {
    const weapons = {}
    data.forEach(({year,injured,weapons_obtained_legally}) => {
        if(weapons_obtained_legally in weapons){
            weapons[weapons_obtained_legally].number += +1
		

        }else if (weapons_obtained_legally.includes("Yes") )
        {weapons[weapons_obtained_legally]={
            number: 1,
            legal: "Yes"
        }
    }
    else if(weapons_obtained_legally.includes("No")){
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
                    label:'Population',
                    data: data.map(d=>Math.round(d.number/s*100)),
                    backgroundColor:["#AED6F1","#DAF7A6","#FFC300"],
                    
                    borderWidth:1,
                    borderColor:'#000',
                    hoverBorderWidth:4,
                    hoverBorderColor:"Black",
                }]
                


            },
            options:{
                title:{
                    display: true,
                    text:"Armes legales et illégales",
                    fontSize : 20,

                },
                legend:{
                    display:true,
                    position:'right',
                    labels:{
                        fontColor:"Black" 
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
                    enabled:true
                }
            
                

            }
        });

    })
