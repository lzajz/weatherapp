//importing modules
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");

app.use(bodyParser.urlencoded({ extended: true }));

//defines route for handling GET request 
//when user vistits the url it goes to page.html
//using res.sendfile and dir name represents the current directory 
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/page.html");
});

//handles a post request

app.post("/", function (req, res) {
  const cityName = req.body.cityName;

  // Fetch latitude and longitude coordinates for the city or zip code
  const geoApiKey = "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={c08d47b389e5ee37d0650a85f3b411dd}";
  const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&apiKey=${geoApiKey}`;
  
  
  //https module get(), takes geoURL as the url to fetch data from
  //empty string to accumlate and receive data 

  https.get(geoUrl, function (response) {
    let data = "";
//an event listener for "data" emitted by response. it is called whenever a chunk of data
//is received , it append chunk to the data string
    response.on("data", function (chunk) {
      data += chunk;
    });
//event listerner for the "end" event emitted by the response. its called when all data is recieved
//the data is then parsed into an object 
    response.on("end", function () {
      const geoData = JSON.parse(data);
  //checks if geo data is true and it it contains features and if feautures is an array an at least one of them
 if (geoData && geoData.features && geoData.features.length > 0) {
  const latitude = geoData.features[0].properties.lat;
 const longitude = geoData.features[0].properties.lon;
        
        //  Fetch weather information using latitude and longitude
        const weatherApiKey = "c08d47b389e5ee37d0650a85f3b411dd";
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=imperial`;
        //


   //initiates get rquest 
        https.get(weatherUrl, function (weatherResponse) {
          let weatherData = "";
          //empty string 

          // will append to weather data 
          weatherResponse.on("data", function (weatherChunk) {
            weatherData += weatherChunk;
          });
          //setting variables and 
          weatherResponse.on("end", function () {
            const weatherJsonData = JSON.parse(weatherData);
            const temp = weatherJsonData.main.temp;
            const des = weatherJsonData.weather[0].description;
            const icon = weatherJsonData.weather[0].icon;
            const imageUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
           // the weather info is sent as an http respnse these methods
           
            res.write(`<h1>The temperature in ${cityName} is ${temp} degrees</h1>`);
            res.write(`<p>The weather description is ${des} </p>`);
            res.write(`<img src="${imageUrl}" alt="Weather icon">`);
            res.send();
          });
          //an error event listener for https get reqquest, if err it will log an err
        }).on("error", function (error) {
          console.error("Error fetching weather data:", error);
          res.send("Error fetching weather data.");
        });
        //if api response does not contain any valid location data 
      } else {
        res.send("Invalid city or zip code.");
      }
    });
    //if error , it will log an error 
  }).on("error", function (error) {
    console.error("Error fetching coordinates:", error);
    res.send("Error fetching coordinates.");
  });
});
//port, local host 
app.listen(9001);
