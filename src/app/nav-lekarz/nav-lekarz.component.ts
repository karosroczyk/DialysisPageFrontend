import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { WebRequestService } from './../web-request.service';
import { Router} from '@angular/router';
import { DatePipe } from '@angular/common'
import { MatDialog } from '@angular/material/dialog';
import { LekarzSignUpForm } from '../LekarzSignUpForm';
import { DialogContentExampleDialog } from './../dialog-content-example-dialog/dialog-content-example-dialog.component';

@Component({
  selector: 'app-nav-lekarz',
  templateUrl: './nav-lekarz.component.html',
  styleUrls: ['./nav-lekarz.component.scss']
})
export class NavLekarzComponent {
  visiblePacjentPage: boolean;
  numberOfNotifications = 0;
  isBadgeDisabled = true;
  lekarzSignUpForm;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(public datepipe: DatePipe, private webReqService: WebRequestService, public dialog: MatDialog, private breakpointObserver: BreakpointObserver, private router: Router) {
    this.visiblePacjentPage = false;
    this.isBadgeDisabled = true;

    this.webReqService.getLekarzSignUpForm().toPromise().then((res) => {

      console.log(res[0].email);
      this.lekarzSignUpForm = new LekarzSignUpForm(
        res[0].email,
        res[0].password,
        res[0].gender,
        res[0].birthday,
        res[0].patient,
        res[0].patientsList,
        res[0].cityOfInterest,
        res[0].dayOfInterest);

      for (let j = 0; j < res[0].patientsList.length; j++) {

        this.webReqService.getMessages(res[0].email + "_" + res[0].patientsList[j]).toPromise().then(res2 => {

            var message = res2[Object.keys(res2).length - 1].message;

            if (message.includes("Moje przewidywane ciśnienie w")) {
              this.numberOfNotifications += 1;
              this.isBadgeDisabled = false;
            }
        });
      }
    })
  }

  hide() { this.visiblePacjentPage = false; }

  show() { this.visiblePacjentPage = true; }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
    });
    this.numberOfNotifications = 0;
    this.isBadgeDisabled = true;
    dialogRef.componentInstance.name = "nav-lekarz";
  }

  async onLogoutButtonClicked() {
    await this.router.navigate(["/login"]);
    window.location.reload();
  }

}
