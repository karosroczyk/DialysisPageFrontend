import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { WebRequestService } from './../../web-request.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(public dialog: MatDialog, private authService: AuthService, private router: Router, private webReqService: WebRequestService) { }

  ngOnInit() {}

  onLoginButtonClicked(email: string, password: string) {
    this.authService.login(email, password).then((res) => {
      if (!res)
        this.openDialog();
      if (res.status === 200) {
        this.webReqService.get("userSignUpForm").subscribe((resUserForm: HttpResponse<any>) => {
          if (Object.keys(resUserForm).length != 0) {
            this.router.navigate(['']);
          }
          else {
            this.router.navigate(['dashboardlekarz']);
          }
        });
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
    });
    dialogRef.componentInstance.name = "login-page";
  }
}
