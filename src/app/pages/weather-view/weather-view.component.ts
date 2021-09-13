import { Component, OnInit } from '@angular/core';
import { WeatherDataFromWebsite } from '../../WeatherDataFromWebsite';
import * as moment from 'moment';

const toCelsiusOffset = 273.15;
const sunRate = 1000;
const cloudRate = 50;
const minutesRate = 60;
const secondsRate = 3600;
const milisecondsRate = 3600000;

@Component({
  selector: 'app-weather-widget-main',
  templateUrl: './weather-view.component.html',
  styleUrls: ['./weather-view.component.scss']
})
export class WeatherWidgetMainComponent implements OnInit{

  weatherDataFromOpenWeatherMapWebsiteObject;
  private API_key = 'd16fb925a2c60dbccda175c67dec88b7';
  latitude;
  longitude;
 
    constructor(public city_name: String, public date: Date) {
      this.weatherDataFromOpenWeatherMapWebsiteObject = new WeatherDataFromWebsite(this.date, null, null, null, null, true, false, city_name);
      if (city_name == "Current city") {
          if (!navigator.geolocation)
            console.log('Location not supported');

      navigator.geolocation.getCurrentPosition((position) => {});
      this.getWeatherDataCity(this.latitude, this.longitude, this.date);
      this.getDayCity(this.latitude, this.longitude, this.date);
    }
      else {
      this.getWeatherData(this.city_name, this.date);
      this.getDay(this.date);
    }
  }

  ngOnInit() {}

  getWeatherDataCity(latitude, longitude, date) {
    fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en')
        .then(function (response) {
        return response.json();
      })
      .then(responseJSON => { this.setCity(responseJSON); return responseJSON;})
      .then(function (dataFind) {
        return fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + dataFind.locality + '&appid=d16fb925a2c60dbccda175c67dec88b7')
      })
      .then(response => response.json())
      .then(dataFind2 => this.findDayData(this.parseDate(date, 'YYYY-MM-DD HH:mm:SS'), dataFind2))
      .then(data => {
        this.setWeatherData(data);
      });
  }

  getDayCity(latitude, longitude, dataFromUser) {
    fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en')
      .then(function (response) {
        if (response.ok)
          return response.json();
        else
          return Promise.reject(response);
      })
      .then(function (dataFind) {
        let city = dataFind.locality;
        return fetch('https://api.openweathermap.org/data/2.5/weather?q=' + dataFind.locality + '&appid=d16fb925a2c60dbccda175c67dec88b7')
      })
      .then(response => response.json())
      .then(data => { this.setDay(data, dataFromUser); this.setCloud(data) });
  }

  getWeatherData(city, day: Date){
    fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + this.city_name + '&appid=' + this.API_key)
      .then(response => response.json())
      .then(dataFind => this.findDayData(this.parseDate(day, 'YYYY-MM-DD HH:mm:SS'), dataFind))
        .then(data => {
            if(data)
                this.setWeatherData(data)
            else
                console.log("City not found")
        });
  }

  setWeatherData(data) {
    this.weatherDataFromOpenWeatherMapWebsiteObject.temperature = this.KelvinToCelsius(data.main.temp);
    this.weatherDataFromOpenWeatherMapWebsiteObject.humidity = data.main.humidity;
    this.weatherDataFromOpenWeatherMapWebsiteObject.windSpeed = data.wind.speed;
    this.weatherDataFromOpenWeatherMapWebsiteObject.pressure = data.main.pressure;
    this.weatherDataFromOpenWeatherMapWebsiteObject.pressure = data.main.pressure;
  }

  setCity(data) {
    this.weatherDataFromOpenWeatherMapWebsiteObject.city = data.locality;
  }

  getDay(dataFromUser) {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + this.city_name + '&appid=' + this.API_key)
      .then(response => response.json())
      .then(data => { this.setDay(data, dataFromUser); this.setCloud(data) })
  }

    setDay(data, dataFromUser) {
        if (data.cod == 200) {
          let sunset = new Date(data.sys.sunset * sunRate);
          let sunrise = new Date(data.sys.sunrise * sunRate);

            var sunsetHour = new Date();
            sunsetHour.setTime(sunset.getTime())
            var sunriseHour = new Date();
            sunriseHour.setTime(sunrise.getTime())
            var nowHour = new Date(dataFromUser);

            this.weatherDataFromOpenWeatherMapWebsiteObject.isDay = (nowHour.getHours() < sunsetHour.getHours()) && (nowHour.getHours() > sunriseHour.getHours());
        }
    }

    setCloud(data) {
        if (data.cod == 200) {
            let clouds = data.clouds.all;
          this.weatherDataFromOpenWeatherMapWebsiteObject.isCloudy = (clouds > cloudRate);
        }
    }

    findDayData(dayToFind: string, data) {
        if (data.cod == 200) {
            for (var i = 0; i < data.list.length; i++) {
                if (data.list[i].dt_txt == dayToFind)
                    return data.list[i]
            }
            return data.list[1];
        }
    return 0;
    }

  KelvinToCelsius(temperature : number){
    var temperatureCelsius = temperature - toCelsiusOffset;
    return Number(temperatureCelsius.toFixed(1));
  }

  parseDate(date: Date, format : string) {
    date = this.roundHours(date, 3);
    return moment(date).format(format);
  }

  roundTo(num, interval) {
    return Math.round(num / interval) * interval;
  }

  roundHours(date, interval) {
    var newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 2);
    var hour = newDate.getHours() + newDate.getMinutes() / minutesRate + newDate.getSeconds() / secondsRate + newDate.getMilliseconds() / milisecondsRate;
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    newDate.setHours(this.roundTo(hour, interval));
    return newDate;
  }
}
