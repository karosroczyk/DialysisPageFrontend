import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserSignUpForm } from '../../UserSignUpForm';
import { WebRequestService } from './../../web-request.service';
import { LekarzSignUpForm } from '../../LekarzSignUpForm';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit {

  private userSignUpForm = new UserSignUpForm(null, null, null, null, null, null, null, null, "Kraków", new Date());
  private lekarzSignUpForm = new LekarzSignUpForm('', '', true, new Date(), false, ['karolinapacjent1'], "Kraków", new Date());
  isPatient: number;

  dialysisYesNo: string;
  dialysisChoice: string[] = ['Tak', 'Nie'];

  genderWomanMan: string;
  genderChoice: string[] = ['Kobieta', 'Mężczyzna'];

  patientYesNo: string;
  patientChoice: string[] = ['Pacjent', 'Lekarz'];

  firstDialysisInput: any;

  usersList;
  selectedDoctor;
  selectedPatients;

  isErrorAuthPatient = true;
  isErrorAuthDoctor = true;

  constructor(public dialog: MatDialog, private authService: AuthService, private router: Router, private webReqService: WebRequestService, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.data.subscribe((res) => {
      this.usersList = res.usersListFromDB;
    })
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.isPatient = +params['id'];
    });
  }

  onSignupButtonClickedForPatient(email: string, password: string, birthday: Date) {
    this.userSignUpForm.email = email;
    this.userSignUpForm.password = password;

    if (this.genderWomanMan === "Kobieta")
      this.userSignUpForm.gender = false;
    else
      this.userSignUpForm.gender = true;

    this.userSignUpForm.birthday = birthday;
    this.userSignUpForm.firstDialysis = this.firstDialysisInput;

    if (this.dialysisYesNo === "Tak")
      this.userSignUpForm.diabetes = true;
    else
      this.userSignUpForm.diabetes = false;

    this.userSignUpForm.patient = true;

    this.userSignUpForm.lekarz = this.selectedDoctor;

      this.authService.signup(email, password).then((res) => {
        if (!res)
          this.openDialog();
        if (res.status === 200) {
          this.webReqService.postUserSignUpForm('userSignUpForm', this.userSignUpForm).then(
            (res2: HttpResponse<any>) => {
              if (res2)
                this.isErrorAuthPatient = false;
            }).then(error => {
              if (this.isErrorAuthPatient) {
                this.openDialogUserSignUpFormData(false);
                this.router.navigate(['/signup/1']);
              }
              else
                this.openDialogUserSignUpFormData(true);
            });
          this.router.navigate(['/login']);
        }
      });
  }

  onSignupButtonClickedForDoctor(email: string, password: string, birthday: Date) {
    this.lekarzSignUpForm.email = email;
    this.lekarzSignUpForm.password = password;

    if (this.genderWomanMan === "Kobieta")
      this.lekarzSignUpForm.gender = false;
    else
      this.lekarzSignUpForm.gender = true;

    this.lekarzSignUpForm.birthday = birthday;

    this.lekarzSignUpForm.patient = false;

    this.lekarzSignUpForm.patientsList = this.selectedPatients;

    this.authService.signup(email, password).then((res) => {
      if (!res)
        this.openDialog();
      if (res.status === 200){
        this.webReqService.postLekarzSignUpForm('lekarzSignUpForm', this.lekarzSignUpForm).then(
          (res2: HttpResponse<any>) => {
            if (res2)
              this.isErrorAuthDoctor = false;
          }).then(error => {
            if (this.isErrorAuthDoctor) {
              this.openDialogUserSignUpFormData(false);
              this.router.navigate(['/signup/0']);
            }
            else
              this.openDialogUserSignUpFormData(true);
          });
        this.router.navigate(['/login']);
      }
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
    });
    dialogRef.componentInstance.name = "signup-page";
  }

  openDialogUserSignUpFormData(success) {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
    });

    if (success)
      dialogRef.componentInstance.name = "correct-patient-data";
    else
      dialogRef.componentInstance.name = "wrong-patient-data";
  }
}
