

d3.csv('Mass-Shootings-1982-2020.csv').then(data=>{
   
    var male = 0
    var female = 0
    data.forEach(d=>{
        if(d.gender=="Female"||d.gender.includes("F"))
        {
            female+=1
        }else {male+=1}
    })
    male = male/(male+female)*100

    weapons = data.map(d=>d.weapon_type)
    var counts = {};

    for (var i = 0; i < weapons.length; i++) {
    var num = weapons[i];
    counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    console.log(Math.max(...Object.values(counts)))
    console.log(counts)

    const mort = data.map(d=> +d.fatalities + +d.injured).reduce((a,b)=> a+b,0)
    console.log(mort)

    

    document.getElementById("male").innerHTML = '<h5 class="card-title" >'+male.toFixed(0).toString()+'% Des Crimes </h5><h6 class="card-subtitle mb-2 text-muted">Sont commis par des hommes</h6>'
    document.getElementById("mort").innerHTML = '<h5 class="card-title" >'+mort.toString()+' morts et blessés </h5><h6 class="card-subtitle mb-2 text-muted">Depuis 1982</h6>'
});
