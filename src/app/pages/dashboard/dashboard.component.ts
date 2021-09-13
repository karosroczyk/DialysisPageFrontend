import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { WeatherWidgetMainComponent } from './../weather-view/weather-view.component';
import * as moment from 'moment';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, registerables } from 'node_modules/chart.js'
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { WebRequestService } from './../../web-request.service';
import { HttpResponse } from '@angular/common/http';
import { UserSignUpForm } from '../../UserSignUpForm';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { jsPDF } from 'jspdf';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  public choosenTime: string;

  weatherDataForCurrentCity: WeatherWidgetMainComponent;
  weatherDataForChoosenCity: WeatherWidgetMainComponent;

  userSignUpForm: UserSignUpForm;
  userSignUpFormId: string;
  userForms = [];

  //Wykres liniowy
  lineChart;
  bodyTemperatureHistory = [];
  weightHistory = [];
  sbpHistory = [];
  dbpHistory = [];
  daysHistory = [];
  dataToDisplay = ["Masa ciała", "Temperatura ciała", "Ciśnienie"]
  dataToDisplaySelected = "Ciśnienie";

  //Historia wpisów
  userFormsReverse = [];
  dataSource = new MatTableDataSource(this.userFormsReverse);
  displayedColumns: string[] = ['datetime', 'weight_start', 'body_temperature', 'sbp', 'dbp'];

  //Wykres średnich wartości
  weightAverage;
  bodyTemperatureAverage;
  sbpAverage;
  dbpAverage;

  //Needle chart
  lastMeasuredDate;
  lastMeasuredHour; 
  lastWeight = 0;
  lastBodyTemperature = 0;
  lastSbpValue;
  lastSbpLabel;
  lastDbpValue;
  lastDbpLabel;
  canvasWidth = 230;
  name_sbp = 'Ciśnienie skurczowe';
  name_dbp = 'Ciśnienie rozkurczowe';
  options_sbp = {
    hasNeedle: true,
    needleColor: '#585858',
    needleFont: 'Consolas',
    arcDelimiters: [23,36, 60, 72],
    arcColors: ['#e43834', '#fdc204', '#8bc24a', '#fdc204', '#e43834'],
    arcPadding: 6,
    arcPaddingColor: 'white',
    arcLabels: ['60','90', '150', '180'],
    arcLabelFontSize: false,
    rangeLabel: ['0', '250'],
    rangeLabelFontSize: false,
    labelsFont: 'Consolas',
  }
  options_dbp = {
    hasNeedle: true,
    needleColor: '#585858',
    needleFont: 'Consolas',
    arcDelimiters: [23, 36, 60, 72],
    arcColors: ['#e43834', '#fdc204', '#8bc24a', '#fdc204', '#e43834'],
    arcPadding: 6,
    arcPaddingColor: 'white',
    arcLabels: ['35', '54', '90', '110'],
    arcLabelFontSize: false,
    rangeLabel: ['0', '150'],
    rangeLabelFontSize: false,
    labelsFont: 'Consolas'
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('pdfTable', { static: false }) el!: ElementRef;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.createLineChartForPressure();
  }

  public async ngOnInit(): Promise<void> {
    var day = new Date(this.userSignUpForm.dayOfInterest);
    var hour = day.getHours();
    
    if(hour < 10)
      this.choosenTime = "0" + String(hour) + ":00";
    else
      this.choosenTime = String(hour) + ":00";

    let dateNow = new Date();
    dateNow.setDate(dateNow.getDate() + 1);
    dateNow.setHours(hour, 0, 0);
    
    this.userSignUpForm.dayOfInterest = dateNow;

    this.webReqService.patchUserSignUpForm('userSignUpForm', this.userSignUpFormId, this.userSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })

    this.weatherDataForCurrentCity = new WeatherWidgetMainComponent("Current city", this.userSignUpForm.dayOfInterest);
    this.weatherDataForChoosenCity = new WeatherWidgetMainComponent(this.userSignUpForm.cityOfInterest, this.userSignUpForm.dayOfInterest);
  }

  constructor(public dialog: MatDialog, private atp: AmazingTimePickerService, private webReqService: WebRequestService, private elementRef: ElementRef, private breakpointObserver: BreakpointObserver, private router: Router, private activatedRoute: ActivatedRoute, public datepipe: DatePipe) {
    this.activatedRoute.data.subscribe((res) => {
      let length = res.userFormFromDB[0].length - 1;

      this.userSignUpForm = res.userFormFromDB[1][0];
      this.userSignUpFormId = res.userFormFromDB[1][0]._id;

      for (let i = 0; i < res.userFormFromDB[0].length; i++) {
        this.userForms.push(res.userFormFromDB[0][i]);
        this.userFormsReverse.push(res.userFormFromDB[0][length - i]);
        this.userFormsReverse[i].datetime = this.datepipe.transform(res.userFormFromDB[0][length - i].datetime, 'M/d/YYYY HH:mm');

        this.weightHistory.push(res.userFormFromDB[0][i].weight_start);
        this.bodyTemperatureHistory.push(res.userFormFromDB[0][i].body_temperature);
        this.sbpHistory.push(res.userFormFromDB[0][i].sbp);
        this.dbpHistory.push(res.userFormFromDB[0][i].dbp);
        this.daysHistory.push(this.datepipe.transform(res.userFormFromDB[0][i].datetime, 'M/d/YYYY HH:mm'));
      }

      if (length >= 0) {
        this.lastWeight = this.weightHistory[length];
        this.lastBodyTemperature = this.bodyTemperatureHistory[length];
        this.lastMeasuredDate = this.datepipe.transform(res.userFormFromDB[0][length].datetime, 'M/d/YYYY');
        this.lastMeasuredHour = this.datepipe.transform(res.userFormFromDB[0][length].datetime, 'HH:mm');
        this.lastSbpValue = Math.round(((res.userFormFromDB[0][length].result_sbp) * 10) / 25);
        this.lastSbpLabel = Math.round(res.userFormFromDB[0][length].result_sbp) + " mmHg";
        this.lastDbpValue = Math.round(((res.userFormFromDB[0][length].result_dbp) * 10) / 15);
        this.lastDbpLabel = Math.round(res.userFormFromDB[0][length].result_dbp) + " mmHg";

        this.weightAverage = this.calculateAverage(this.weightHistory, "masa");
        this.bodyTemperatureAverage = this.calculateAverage(this.bodyTemperatureHistory, "temperatura");
        this.sbpAverage = this.calculateAverage(this.sbpHistory);
        this.dbpAverage = this.calculateAverage(this.dbpHistory);
      }
    })
  }

  changeLineChart() {
    this.lineChart.destroy();
    if (this.dataToDisplaySelected == "Masa ciała")
      this.createLineChart(this.weightHistory);
    if (this.dataToDisplaySelected == "Temperatura ciała")
      this.createLineChart(this.bodyTemperatureHistory);
    if (this.dataToDisplaySelected == "Ciśnienie")
      this.createLineChartForPressure();
  }

  createLineChart(dane) { 
    Chart.register(...registerables);
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title);

    this.lineChart = new Chart("canvasId", {
      type: 'line',
      data: {
        labels: this.daysHistory,
        datasets: [
          {
            label: this.dataToDisplaySelected,
            data: dane,
            borderColor: "#3cba9f",
            fill: false
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  createLineChartForPressure() {
    Chart.register(...registerables);
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title);

    this.lineChart = new Chart("canvasId", {
      type: 'line',
      data: {
        labels: this.daysHistory,
        datasets: [
          {
            label: "Ciśnienie SBP",
            data: this.sbpHistory,
            borderColor: "#3cba9f",
            fill: false
          },
          {
            label: "Ciśnienie DBP",
            data: this.dbpHistory,
            borderColor: "#3abc9h",
            fill: false
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  onCityUpdate(city)
  {
    this.userSignUpForm.cityOfInterest = city;
    this.webReqService.patchUserSignUpForm('userSignUpForm', this.userSignUpFormId, this.userSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })
    window.location.reload();
  }

  onHourUpdate(hour){
    var splittedHour = hour.split(":", 2);
    this.userSignUpForm.dayOfInterest.setHours((Number(splittedHour[0])), splittedHour[1]);
    this.webReqService.patchUserSignUpForm('userSignUpForm', this.userSignUpFormId, this.userSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })   
    window.location.reload();
  }

  async onAddButtonClick() {
    await this.router.navigate(["/lists"]);
    window.location.reload();
  }

  onDownloadFileButtonClick() {
    let doc = new jsPDF('l', 'px', [595.28, 600.00]);

    doc.html(this.el.nativeElement, {
      callback: (doc) => {
        doc.save(this.userSignUpForm.email + "_historiaWpisow" + ".pdf");
      }
    })
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

  calculateAverage(data, nameOfPointer = "") {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      sum += parseInt(data[i], 10);
    }

    var avg = sum / data.length;

    if (nameOfPointer != "")
      return avg.toFixed(1);
    return Math.round(avg);
  }

  cards = this.breakpointObserver.observe(Breakpoints.WebLandscape).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 2, rows: 1, data: null, date: null, hour: null, id: null },
          { title: 'Card 2', cols: 1, rows: 1, data: this.weatherDataForCurrentCity, date: moment(this.userSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.userSignUpForm.dayOfInterest).format('HH:mm'), id: 0 },
          { title: 'Card 3', cols: 1, rows: 1, data: this.weatherDataForChoosenCity, date: moment(this.userSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.userSignUpForm.dayOfInterest).format('HH:mm'), id: 1 },
          { title: 'Card 4', cols: 2, rows: 1, data: null, date: null, hour: null, id: null },
          { title: 'Card 5', cols: 2, rows: 2, data: null, date: null, hour: null, id: null },
          { title: 'Card 6', cols: 2, rows: 1, data: null, date: null, hour: null, id: null }
        ];
      }
      else {
        return [
          { title: 'Card 1', cols: 4, rows: 1, data: null, date: null, hour: null, id: null },
          { title: 'Card 2', cols: 2, rows: 1, data: this.weatherDataForCurrentCity, date: moment(this.userSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.userSignUpForm.dayOfInterest).format('HH:mm'), id: 0 },
          { title: 'Card 3', cols: 2, rows: 1, data: this.weatherDataForChoosenCity, date: moment(this.userSignUpForm.dayOfInterest).format('YYYY-MM-DD'), hour: moment(this.userSignUpForm.dayOfInterest).format('HH:mm'), id: 1 },
          { title: 'Card 4', cols: 4, rows: 1, data: null, date: null, hour: null, id: null },
          { title: 'Card 5', cols: 4, rows: 2, data: null, date: null, hour: null, id: null },
          { title: 'Card 6', cols: 4, rows: 1, data: null, date: null, hour: null, id: null },
        ];
      }
    })
  );
}
