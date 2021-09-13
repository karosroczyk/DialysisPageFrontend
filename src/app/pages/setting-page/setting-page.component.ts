import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UserSignUpForm } from '../../UserSignUpForm';
import { WebRequestService } from './../../web-request.service';
import { DatePipe } from '@angular/common'
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';

@Component({
  selector: 'app-setting-page',
  templateUrl: './setting-page.component.html',
  styleUrls: ['./setting-page.component.scss']
})

export class SettingPageComponent implements OnInit {

  userSignUpForm: UserSignUpForm;
  userSignUpFormId: string;
  signUpFormId: string;

  userSignUpFormBirthdayTransformed: string;
  userSignUpFormFirstDialysisTransformed: string;

  diabetesYesNo: string;
  diabetesChoice: string[] = ['Tak', 'Nie'];

  genderWomanMan: string;
  genderChoice: string[] = ['Kobieta', 'Mężczyzna'];

  patientYesNo: string;
  patientChoice: string[] = ['Pacjent', 'Lekarz'];

  doctorsList;
  selectedDoctor;

  constructor(public dialog: MatDialog, private webReqService: WebRequestService, private activatedRoute: ActivatedRoute, public datepipe: DatePipe) {
    this.activatedRoute.data.subscribe((res) => {

      this.signUpFormId = res.userFormFromDB[0][0]._id;
      this.userSignUpFormId = res.userFormFromDB[0][0]._userId;
      this.userSignUpForm = res.userFormFromDB[0][0];
      this.doctorsList = res.userFormFromDB[1];
    })

    if (this.userSignUpForm.gender === false)
      this.genderWomanMan = "Kobieta"
    else
      this.genderWomanMan = "Mężczyzna"

    if (this.userSignUpForm.diabetes === true)
      this.diabetesYesNo = "Tak"
    else
      this.diabetesYesNo = "Nie"

    if (this.userSignUpForm.patient === true)
      this.patientYesNo = "Pacjent"
    else
      this.patientYesNo = "Lekarz"

    this.userSignUpFormBirthdayTransformed = this.datepipe.transform(this.userSignUpForm.birthday, 'M/d/YYYY');
    this.userSignUpFormFirstDialysisTransformed = this.datepipe.transform(this.userSignUpForm.firstDialysis, 'M/d/YYYY');
  }

  ngOnInit() {}

  onUpdateButtonClicked(email: string, password: string, birthday: Date, firstDialysis: Date) {
    if (email != "")
      this.userSignUpForm.email = email;

    if (password != "")
      this.userSignUpForm.password = password;

    if (this.selectedDoctor != "")
      this.userSignUpForm.lekarz = this.selectedDoctor;

    if (this.genderWomanMan === "Kobieta")
      this.userSignUpForm.gender = false;
    else
      this.userSignUpForm.gender = true;

    if (birthday.toString() != "")
      this.userSignUpForm.birthday = birthday;

    if (firstDialysis.toString() != "")
      this.userSignUpForm.firstDialysis = firstDialysis;

    if (this.diabetesYesNo === "Tak")
      this.userSignUpForm.diabetes = true;
    else
      this.userSignUpForm.diabetes = false;

    this.webReqService.patchUserSignUpForm('userSignUpForm', this.signUpFormId, this.userSignUpForm).toPromise().then((res) => {
      console.log(res);
    })

    this.webReqService.patchUser('user', this.userSignUpFormId, this.userSignUpForm).subscribe((res: HttpResponse<any>) => {
      this.openDialog();
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
    });

    dialogRef.componentInstance.name = "setting-page-1";
  }
}
