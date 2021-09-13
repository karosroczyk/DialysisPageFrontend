import { Component, OnInit, Input } from '@angular/core';
import { UserForm } from '../../UserForm';
import * as tf from '@tensorflow/tfjs';
import { WeatherWidgetMainComponent } from './../weather-view/weather-view.component';
import { HttpResponse } from '@angular/common/http';
import { WebRequestService } from './../../web-request.service';
import { UserSignUpForm } from '../../UserSignUpForm';
import { ActivatedRoute } from '@angular/router';
import { io } from 'socket.io-client';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';
import { Router } from '@angular/router';

const SOCKET_ENDPOINT = 'https://dialysis-page-server.herokuapp.com';

const MpsToMphRate = 3.6;
const hPaToHgRate = 0.03;
const CelsiusToFahrenheitRate = 1.8;
const CelsiusToFahrenheitElement = 32;
const dia_temp_value_default = 36.5;
const conductivity_default = 14;
const uf_default = 0.5;
const blood_flow_default = 236;
const dialysis_time_default = 130;

const sbpPredictionUpTreshold = 150;
const sbpPredictionDownTreshold = 90;
const dbpPredictionUpTreshold = 90;
const dbpPredictionDownTreshold = 54;

@Component({
  selector: 'app-userData-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  private bloodPressurePredictionNetwork;
  weatherDataFromOpenWeatherMapWebsite: WeatherWidgetMainComponent;
  userFormsList;
  socket: any;

  message_dbp = "";
  message_sbp = "Brak";

  MeanStd = {
    dia_temp_value: [36.458167, 0.398057],
    conductivity: [14.058829, 0.236673],
    uf: [0.579291, 0.349579],
    blood_flow: [236.972216, 33.799405],
    dialysis_time: [129.207408, 78.880594],
    weight_start: [60.759856, 16.204829],
    body_temperature: [36.409729, 0.264495],
    gender: [0.404302, 0.490758],
    birthday: [1949.702439, 12.758266],
    first_dialysis: [2007.550160, 4.163612],
    diabetes: [0.410864, 0.491992],
    atmosphere_temperature: [74.639399, 10.300120],
    humidity: [70.274398, 9.606430],
    wind_speed: [9.168771, 3.862966],
    atmosphere_pressure: [29.912104, 0.211005],
    // sdp i dbp sa randomowe
    sbp: [133.255559, 26.634672],
    dbp: [67.012511, 14.134120]
  };

  private userDataFromSignUpForm: UserSignUpForm;
  private userDataFromForm = new UserForm(
    null, null, null, null,
    dia_temp_value_default,
    conductivity_default,
    uf_default,
    blood_flow_default,
    dialysis_time_default,
    new Date(), 0, 0);

  private userDataFromFormNormalized = new UserForm(
    null, null, null, null,
    this.normalizeData("dia_temp_value", dia_temp_value_default),
    this.normalizeData("conductivity", conductivity_default),
    this.normalizeData("uf", uf_default),
    this.normalizeData("blood_flow", blood_flow_default),
    this.normalizeData("dialysis_time", dialysis_time_default),
    new Date(), 0, 0);

  constructor(private router: Router, public dialog: MatDialog, private webReqService: WebRequestService, private activatedRoute: ActivatedRoute, public datepipe: DatePipe) {
    this.activatedRoute.data.subscribe((res) => {
      this.userDataFromSignUpForm = new UserSignUpForm(
        res.userFormFromDB[0][0].email,
        res.userFormFromDB[0][0].password,
        res.userFormFromDB[0][0].gender,
        res.userFormFromDB[0][0].birthday,
        res.userFormFromDB[0][0].firstDialysis,
        res.userFormFromDB[0][0].diabetes,
        res.userFormFromDB[0][0].patient,
        res.userFormFromDB[0][0].lekarz,
        res.userFormFromDB[0][0].cityOfInterest,
        res.userFormFromDB[0][0].dayOfInterest);
    })

    this.webReqService.getUserForms().subscribe((res) => {
      this.userFormsList = res;
    });
  }

  public async ngOnInit(): Promise<void> {
    this.bloodPressurePredictionNetwork = await tf.loadLayersModel('assets/multipleOutputkCrosse500m2modelJSON.json');
    this.weatherDataFromOpenWeatherMapWebsite = new WeatherWidgetMainComponent(
      this.userDataFromSignUpForm.cityOfInterest, this.userDataFromSignUpForm.dayOfInterest);
  }

  onSubmitButton() {
    var isError = true;
    var isErrorPrediction = true;
    var prediction = this.makePrediction()

    this.userDataFromForm.datetime = new Date();
    this.userDataFromForm.result_sbp = prediction.result_sbp;
    this.userDataFromForm.result_dbp = prediction.result_dbp;
    var lastUserForm = this.userFormsList[this.userFormsList.length - 1]

    if (this.userFormsList.length > 0)
      this.webReqService.deleteLastPrediction(lastUserForm._id).subscribe((res: HttpResponse<any>) => {
        console.log(res);
      })

    this.webReqService.postUserForm('userForm', this.userDataFromForm).then((res: HttpResponse<any>) => {
      if (res)
        isError = false;
    }).then(error => {
      if (isError)
        this.openDialogUserFormData(false);
      else
        this.openDialogUserFormData(true);
      this.router.navigate(['/lists']);
    })

    this.webReqService.postUserForm('userForm', prediction).then((res: HttpResponse<any>) => {
      if (res)
        isErrorPrediction = false;
    }).then(error => {
      if (isErrorPrediction)
        this.openDialogUserFormData(false);
      this.router.navigate(['/lists']);
    })
  }

  makePrediction() {
    const inputData = tf.tensor([[
      this.userDataFromFormNormalized.dia_temp_value,
      this.userDataFromFormNormalized.conductivity,
      this.userDataFromFormNormalized.uf,
      this.userDataFromFormNormalized.blood_flow,
      this.userDataFromFormNormalized.dialysis_time,
      this.userDataFromFormNormalized.weight_start,
      this.userDataFromFormNormalized.body_temperature,
      this.normalizeData("gender", Number(this.userDataFromSignUpForm.gender)),
      this.normalizeData("birthday", (new Date(this.userDataFromSignUpForm.birthday)).getFullYear()),
      this.normalizeData("first_dialysis", (new Date(this.userDataFromSignUpForm.firstDialysis)).getFullYear()),
      this.normalizeData("diabetes", Number(this.userDataFromSignUpForm.diabetes)),
      this.normalizeData("atmosphere_temperature", this.CelsiusToFahrenheit(
        this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.temperature)),
      this.normalizeData("humidity", this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.humidity),
      this.normalizeData("wind_speed", this.MpsToMph(
        this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.windSpeed)),
      this.normalizeData("atmosphere_pressure", this.hPaToHg(
        this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.pressure))
      //this.normalizeData("temperature_sqrt", (this.userDataFromForm.body_temperature * this.userDataFromForm.body_temperature)),
      //this.normalizeData("weightstart_sqrt", (this.userDataFromForm.weight_start * this.userDataFromForm.weight_start)),
      //this.normalizeData("blood_flow_sqrt", (this.userDataFromForm.blood_flow * this.userDataFromForm.blood_flow)),
      //this.normalizeData("conductivity_sqrt", (this.userDataFromForm.conductivity * this.userDataFromForm.conductivity))
    ]]);

    //const inputData = tf.tensor([[
    //  -1.151228, - 0.251891, 5.383834, 1.240663, - 1.611374, 2.059690, 0.339439, 1.212646, - 0.838051, - 1.660216, 1.196246, - 0.205641, - 0.661389, 0.216606, 0.889508, 0.335798, 1.700589, 1.384515, - 0.269957]]);

    console.log(this.userDataFromFormNormalized.dia_temp_value + " \n" +
      this.userDataFromFormNormalized.conductivity + " \n" +
      this.userDataFromFormNormalized.uf + " \n" +
      this.userDataFromFormNormalized.blood_flow + " \n" +
      this.userDataFromFormNormalized.dialysis_time + " \n" +
      this.userDataFromFormNormalized.weight_start + " \n" +
      this.userDataFromFormNormalized.body_temperature + " \n" +
      this.normalizeData("gender", Number(this.userDataFromSignUpForm.gender)) + " \n" +
      this.normalizeData("birthday", (new Date(this.userDataFromSignUpForm.birthday)).getFullYear()) + " \n" +
      this.normalizeData("first_dialysis", (new Date(this.userDataFromSignUpForm.firstDialysis)).getFullYear()) + " \n" +
      this.normalizeData("diabetes", Number(this.userDataFromSignUpForm.diabetes)) + " \n" +
      this.normalizeData("atmosphere_temperature", this.CelsiusToFahrenheit(
        this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.temperature)) + " \n" +
      this.normalizeData("humidity", this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.humidity) + " \n" +
      this.normalizeData("wind_speed", this.MpsToMph(
        this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.windSpeed)) + " \n" +
      this.normalizeData("atmosphere_pressure", this.hPaToHg(
        this.weatherDataFromOpenWeatherMapWebsite.weatherDataFromOpenWeatherMapWebsiteObject.pressure)));

    const prediction = this.bloodPressurePredictionNetwork.predict(inputData).dataSync();

    let resultPrediction_sbp = parseInt(prediction[0], 10);
    let resultPrediction_dbp = parseInt(prediction[1], 10);
    this.message_sbp = "Twoje przewidywane ciśnienie SBP wynosi: " + resultPrediction_sbp;
    this.message_dbp = "Twoje przewidywane ciśnienie DBP wynosi: " + resultPrediction_dbp;

    if ((resultPrediction_sbp > sbpPredictionUpTreshold && dbpPredictionUpTreshold > 90)
      || (resultPrediction_sbp < sbpPredictionDownTreshold && dbpPredictionDownTreshold < 54)) {
      let messageToSend = "Moje przewidywane ciśnienie w " + this.userDataFromSignUpForm.cityOfInterest +
        " na dzień " + this.datepipe.transform(this.userDataFromSignUpForm.dayOfInterest, 'M/d/YYYY') +
        " i godzine " + this.datepipe.transform(this.userDataFromSignUpForm.dayOfInterest, 'HH:00') +
        " wynosi: " + resultPrediction_sbp + "/" + resultPrediction_dbp;

      this.setupSocketConnection();
      this.socket.emit('create', this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email);
      this.socket.emit('message', messageToSend, this.userDataFromSignUpForm.email, this.userDataFromSignUpForm.lekarz, this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email);
      this.socket.emit('userforms', this.userFormsList, this.userDataFromSignUpForm.email, this.userDataFromSignUpForm.lekarz, this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email);
    }

    return new UserForm(
      this.userDataFromForm.weight_start,
      this.userDataFromForm.body_temperature,
      resultPrediction_sbp,
      resultPrediction_dbp,
      this.userDataFromForm.dia_temp_value,
      this.userDataFromForm.conductivity,
      this.userDataFromForm.uf,
      this.userDataFromForm.blood_flow,
      this.userDataFromForm.dialysis_time,
      this.userDataFromSignUpForm.dayOfInterest,
      resultPrediction_sbp,
      resultPrediction_dbp);
  }

  setupSocketConnection() {
    this.socket = io(SOCKET_ENDPOINT, { transports: ['websocket'] });

    this.socket.on('message-broadcast', (data) => {
      if (data) {
        const element = document.createElement('li');
        element.innerHTML = data.message;
        element.style.padding = '.4rem 1rem';
        element.style.webkitBorderRadius = '1';
        element.style.borderRadius = '4px';
        element.style.background = '#ffffff';
        element.style.fontWeight = '300';
        element.style.lineHeight = '150 %';
        element.style.position = 'relative';
        element.style.flexDirection = 'column';
        element.style.marginBottom = '10px';

        const myMaybeNullElement = document.getElementById('message-list')
        myMaybeNullElement.appendChild(element);

        var objDiv = document.getElementById("scroll-bottom");
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    });
  }

  onKey(name: string, value: number) {
    if (name == "weight_start") {
      this.userDataFromFormNormalized.weight_start = this.normalizeData("weight_start", value);
      this.userDataFromForm.weight_start = value;
    }
    else if (name == "body_temperature") {
      this.userDataFromFormNormalized.body_temperature = this.normalizeData("body_temperature", value);
      this.userDataFromForm.body_temperature = value;
    }
    else if (name == "sbp") {
      this.userDataFromFormNormalized.sbp = this.normalizeData("sbp", value);
      this.userDataFromForm.sbp = value;
    }
    else if (name == "dbp") {
      this.userDataFromFormNormalized.dbp = this.normalizeData("dbp", value);
      this.userDataFromForm.dbp = value;
    }
    else if (name == "dia_temp_value") {
      this.userDataFromFormNormalized.dia_temp_value = this.normalizeData("dia_temp_value", value);
      this.userDataFromForm.dia_temp_value = value;
    }
    else if (name == "conductivity") {
      this.userDataFromFormNormalized.conductivity = this.normalizeData("conductivity", value);
      this.userDataFromForm.conductivity = value;
    }
    else if (name == "uf") {
      this.userDataFromFormNormalized.uf = this.normalizeData("uf", value);
      this.userDataFromForm.uf = value;
    }
    else if (name == "blood_flow") {
      this.userDataFromFormNormalized.blood_flow = this.normalizeData("blood_flow", value);
      this.userDataFromForm.blood_flow = value;
    }
    else if (name == "dialysis_time") {
      this.userDataFromFormNormalized.dialysis_time = this.normalizeData("dialysis_time", value);
      this.userDataFromForm.dialysis_time = value;
    }
  }

  normalizeData(key: string, value: number) {
    return (value - this.MeanStd[key][0]) / this.MeanStd[key][1];
  }

  CelsiusToFahrenheit(temperature) {
    return (temperature * CelsiusToFahrenheitRate) + CelsiusToFahrenheitElement;
  }

  MpsToMph(wind_speed) {
    return wind_speed * MpsToMphRate;
  }

  hPaToHg(air_pressure) {
    return air_pressure * hPaToHgRate;
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
    });
    dialogRef.componentInstance.name = "user-form";
  }

  openDialogUserFormData(success) {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
    });
    if (success)
      dialogRef.componentInstance.name = "correct-userform-data";
    else
      dialogRef.componentInstance.name = "wrong-userform-data";
  }
}
