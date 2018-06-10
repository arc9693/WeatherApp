const express = require('express');
const request = require('request-promise');
const mongoose = require('mongoose');
const app = express();
const config = require('config');
app.use(express.urlencoded({"extended":true}));
const key=config.get('sk');
mongoose.connect(`mongodb://${key}@ds245170.mlab.com:45170/weatherdata`)
var cityschema= new mongoose.Schema({
  name:String
});

var citymodel = mongoose.model('citymodel',cityschema);
app.set('view engine','ejs');

async function getdata(citymodels) {
  var weather_data=[];
  for(var cityobj of citymodels){
    var city=cityobj.name;
    var url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=0e3e817f46879446e402c437def607bf`;
    var body=await request(url);
    var wj=JSON.parse(body);

    var weather={
      city : city,
      tempreture: wj.main.temp,
      description: wj.weather[0].description,
      icon:wj.weather[0].icon
    };

    weather_data.push(weather);
  }
  return weather_data;

}




app.get('/',(req,res)=>{

     citymodel.find({},function (err,citymodels){

      getdata(citymodels).then(function(results){
        var weather_data={weather_data:results};
        res.render('index', weather_data);
       });
     })

});

app.post('/',(req,res)=>{

var city= new citymodel({
  name:req.body.searchCity
})
city.save();
res.redirect('/');
})


const port= process.env.PORT||8000;
app.listen(port,()=>console.log("Listening on port " ,port));
