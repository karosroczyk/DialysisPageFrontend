import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { LekarzSignUpForm } from '../../LekarzSignUpForm';
import { WebRequestService } from './../../web-request.service';
import { DatePipe } from '@angular/common'
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';

@Component({
  selector: 'app-lekarz-setting-page',
  templateUrl: './lekarz-setting-page.component.html',
  styleUrls: ['./lekarz-setting-page.component.scss']
})
export class LekarzSettingPageComponent implements OnInit {

  lekarzSignUpForm: LekarzSignUpForm;
  userSignUpFormId: string;
  signUpFormId: string;

  userSignUpFormBirthdayTransformed: string;

  genderWomanMan: string;
  genderChoice: string[] = ['Kobieta', 'Mężczyzna'];

  patientsList;
  selectedPatients;

  constructor(public dialog: MatDialog, private webReqService: WebRequestService, private activatedRoute: ActivatedRoute, public datepipe: DatePipe) {
    this.activatedRoute.data.subscribe((res) => {

      this.signUpFormId = res.userFormFromDB[0][0]._id;
      this.userSignUpFormId = res.userFormFromDB[0][0]._userId;
      this.lekarzSignUpForm = res.userFormFromDB[0][0];
      this.patientsList = res.userFormFromDB[1];
    })

    this.selectedPatients = this.lekarzSignUpForm.patientsList;

    if (this.lekarzSignUpForm.gender === false)
      this.genderWomanMan = "Kobieta"
    else
      this.genderWomanMan = "Mężczyzna"

    this.userSignUpFormBirthdayTransformed = this.datepipe.transform(this.lekarzSignUpForm.birthday, 'M/d/YYYY');
  }

  ngOnInit() { }

  onUpdateButtonClicked(email: string, password: string, birthday: Date) {
    if (email != "")
      this.lekarzSignUpForm.email = email;

    if (password != "")
      this.lekarzSignUpForm.password = password;

    if (this.genderWomanMan === "Kobieta")
      this.lekarzSignUpForm.gender = false;
    else
      this.lekarzSignUpForm.gender = true;

    if (birthday.toString() != "")
      this.lekarzSignUpForm.birthday = birthday;

    this.lekarzSignUpForm.patientsList = this.selectedPatients;

    this.webReqService.patchLekarzSignUpForm('lekarzSignUpForm', this.signUpFormId, this.lekarzSignUpForm).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    })

    this.webReqService.patchUser('user', this.userSignUpFormId, this.lekarzSignUpForm).subscribe((res: HttpResponse<any>) => {
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
