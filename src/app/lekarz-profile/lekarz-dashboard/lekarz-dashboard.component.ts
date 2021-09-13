import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { WeatherWidgetMainComponent } from './../../pages/weather-view/weather-view.component';
import * as moment from 'moment';
import { Router,  ActivatedRoute } from '@angular/router';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { LekarzSignUpForm } from '../../LekarzSignUpForm';
import { HttpResponse } from '@angular/common/http';
import { WebRequestService } from './../../web-request.service';


@Component({
  selector: 'app-lekarz-dashboard',
  templateUrl: './lekarz-dashboard.component.html',
  styleUrls: ['./lekarz-dashboard.component.scss']
})
export class LekarzDashboardComponent implements OnInit {

  public choosenTime: string;

  weatherDataForCurrentCity: WeatherWidgetMainComponent;
  weatherDataForChoosenCity: WeatherWidgetMainComponent;

  lekarzSignUpForm: LekarzSignUpForm;
  lekarzSignUpFormId: string;
  patientInfo;
  patientsList;
  allPatientsList;

  //Wyświetlanie podstawowych informacji
  gender;
  birthday;
  firstDialysis;
  diabetes;

  ngOnInit() {
    var day = new Date(this.lekarzSignUpForm.dayOfInterest);
    var hour = day.getHours();
    if (hour < 10)
      this.choosenTime = "0" + String(hour) + ":00";
    else
      this.choosenTime = String(hour) + ":00";

    let dateNow = new Date();
    dateNow.setDate(dateNow.getDate() + 1);
    dateNow.setHours(hour, 0, 0);

    this.lekarzSignUpForm.dayOfInterest = dateNow;

    this.webReqService.patchLekarzSignUpForm('lekarzSignUpForm', this.lekarzSignUpFormId, this.lekarzSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })

    this.weatherDataForCurrentCity = new WeatherWidgetMainComponent("Current city", this.lekarzSignUpForm.dayOfInterest);
    this.weatherDataForChoosenCity = new WeatherWidgetMainComponent(this.lekarzSignUpForm.cityOfInterest, this.lekarzSignUpForm.dayOfInterest);

  }

  constructor(private atp: AmazingTimePickerService, private activatedRoute: ActivatedRoute, private breakpointObserver: BreakpointObserver, private router: Router, private webReqService: WebRequestService) {
    this.activatedRoute.data.subscribe((res) => {
      
      this.lekarzSignUpForm = res.userFormFromDB[0][0];
      this.lekarzSignUpFormId = res.userFormFromDB[0][0]._id;
      this.patientsList = res.userFormFromDB[0][0].patientsList;
    })

    this.webReqService.getPatientsList().subscribe((response) => {
      this.allPatientsList = response;
    })
  }

  patientDataDisplay(patientName) {

    for (var i = 0; i < this.allPatientsList.length; i++) {
      if (this.allPatientsList[i].email === patientName) {
        if (this.allPatientsList[i].gender)
          this.gender = "Mężczyzna"
        else
          this.gender = "Kobieta"

        if (this.allPatientsList[i].diabetes)
          this.diabetes = "Tak"
        else
          this.diabetes = "Nie"

        this.birthday = moment(this.allPatientsList[i].birthday).format('YYYY-MM-DD');
        this.firstDialysis = moment(this.allPatientsList[i].firstDialysis).format('YYYY-MM-DD');
      }
    }
  }

  async onAddRecordButtonClicked() {
    await this.router.navigate(["/lists"]);
    window.location.reload();
  }

  onCityUpdate(city) {
    this.lekarzSignUpForm.cityOfInterest = city;
    this.webReqService.patchLekarzSignUpForm('lekarzSignUpForm', this.lekarzSignUpFormId, this.lekarzSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })
    window.location.reload();
  }

  onHourUpdate(hour) {
    var splittedHour = hour.split(":", 2);
    this.lekarzSignUpForm.dayOfInterest.setHours((Number(splittedHour[0])), splittedHour[1]);
    this.webReqService.patchLekarzSignUpForm('lekarzSignUpForm', this.lekarzSignUpFormId, this.lekarzSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })
    window.location.reload();
  }

  openTimePicker() {
    const amazingTimePicker = this.atp.open({
      onlyHour: true,
      arrowStyle: {
        background: '#5c8b00',
      }
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.choosenTime = time;
      this.onHourUpdate(time);
    });
  }

  cards = this.breakpointObserver.observe(Breakpoints.WebLandscape).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 4, rows: 1, data: null, date: null, hour: null, id: null },
          { title: 'Card 2', cols: 1, rows: 1, data: null, date: null, hour: null, id: null },
          { title: 'Card 3', cols: 1, rows: 1, data: this.weatherDataForCurrentCity, date: moment(this.lekarzSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.lekarzSignUpForm.dayOfInterest).format('HH:mm'), id: 0 },
          { title: 'Card 4', cols: 1, rows: 1, data: this.weatherDataForChoosenCity, date: moment(this.lekarzSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.lekarzSignUpForm.dayOfInterest).format('HH:mm'), id: 1 },

        ];
      }
      return [
        { title: 'Card 1', cols: 4, rows: 1, data: null, date: null, hour: null, id: null },
        { title: 'Card 3', cols: 4, rows: 1, data: this.weatherDataForCurrentCity, date: moment(this.lekarzSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.lekarzSignUpForm.dayOfInterest).format('HH:mm'), id: 0 },
        { title: 'Card 4', cols: 4, rows: 1, data: this.weatherDataForChoosenCity, date: moment(this.lekarzSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.lekarzSignUpForm.dayOfInterest).format('HH:mm'), id: 1 },
      ];
    })
  );
}

