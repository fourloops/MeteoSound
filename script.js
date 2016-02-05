// -------------- GOOGLE API -----------------
// ------ Declares variables & creates google api script with secret key
var currentLocation,
    marker,
    hidden = false,
    weatherResult,
    day,
    response;
    googleScript = document.createElement('script');

googleScript.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + secretKeys.google + '&signed_in=true&callback=initMap');
document.body.appendChild(googleScript);

// ------ Creates map and adds click listener (initMap called by api script tag)

function initMap() {

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 51.5072, lng: 0.1275 },
        mapTypeId: google.maps.MapTypeId.HYBRID,
        draggableCursor:'crosshair'
    });

    map.addListener('click', function(e) {
        placeMarkerAndPanTo(e.latLng, map);
        currentLocation = {
            lat: '' + e.latLng.lat(),
            lng: '' + e.latLng.lng()
        };
        console.log(e.rawOffset);
        weather();
    });
}

//------ Places marker on map and pans to given latitude/longitude -------------

function placeMarkerAndPanTo(latLng, map) {
    if(marker) { marker.setMap(null); }
    marker = new google.maps.Marker({
        position: latLng,
        map: map
    });
    map.panTo(latLng);
}

// ------------ WEATHER API -----------------
// ----- Creates new XMLHttpRequest, assigns returned JSON object to response---

function weather(){
    var xhr = new XMLHttpRequest(),
        url = "http://api.openweathermap.org/data/2.5/weather?lat=" + currentLocation.lat + '&lon=' +currentLocation.lng + "&appid=" +  secretKeys.weather;
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            response = JSON.parse(xhr.responseText);
            day = Date.now()/1000 > response.sys.sunrise && Date.now()/1000 < response.sys.sunset ? true : false;
            weatherResult = getWeather(response.weather[0].id);
            updateInfo();
            setTimeout(cloudSound(weatherResult),500);
            setTimeout(toggleMap,1500);
        }
    };
    xhr.open("GET", url);
    xhr.send();
}

// ----- Translates returned weather ID to specific category --------

function getWeather(id){
    if(id<233 || (id<782 && id>623) || id>=956){
        document.body.style.backgroundImage = day ? "url(assets/extremeDay.jpg)" : "url(assets/extremeNight.jpg)";
        return "extreme";
    }
    else if(id<533){
        document.body.style.backgroundImage = day ? "url(assets/rainDay.jpg)" : "url(assets/rainNight.jpg)";
        return "rain";
    }
    else if(id<623){
        document.body.style.backgroundImage = day ? "url(assets/snowDay.jpg)" : "url(assets/snowNight.jpg)";
        return "snow";
    }
    else if(id<802 || (id>950 && id<956)){
        document.body.style.backgroundImage = day ? "url(assets/clearSkyDay.jpg)" : "url(assets/clearSkyNight.jpeg)";
        return "clear sky";
    }
    else{
        document.body.style.backgroundImage = day ? "url(assets/cloudySkyDay.jpg)" : "url(assets/cloudySkyNight.jpg)";
        return "cloudy sky";
    }
}

document.getElementsByClassName("hideButton")[0].addEventListener("click", toggleMap);

function toggleMap(){
    if(!hidden){
        document.getElementsByClassName("map1")[0].classList.add("maphide");
        document.getElementsByClassName("hideButton")[0].classList.add("hidden");
        document.getElementsByClassName("hideButton")[0].innerHTML="SHOW MAP";
        document.getElementsByClassName("info")[0].classList.add("infoShow");
        hidden = true;
    }
    else{
        document.getElementsByClassName("map1")[0].classList.remove("maphide");
        document.getElementsByClassName("hideButton")[0].classList.remove("hidden");
        document.getElementsByClassName("hideButton")[0].innerHTML="HIDE MAP";
        document.getElementsByClassName("info")[0].classList.remove("infoShow");
        hidden = false;
    }
}

function updateInfo(){
    document.getElementById('area').innerHTML = response.name + ', <em>' + response.sys.country + '<em>';
    document.getElementById('temp').innerHTML = "Temperature: <b>" + (Math.floor(response.main.temp - 273.15)) + '&#8451</b>';
    document.getElementById('condition').innerHTML = "Current Weather:<b> " + response.weather[0].description + '</b>';
}
