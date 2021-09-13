import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { WebRequestService } from './../web-request.service';
import { Router} from '@angular/router';
import { DatePipe } from '@angular/common'
import { Injectable } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { DialogContentExampleDialog } from  './../dialog-content-example-dialog/dialog-content-example-dialog.component';

@Injectable()
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  visiblePacjentPage: boolean;
  numberOfNotifications = 0;
  isBadgeDisabled = true;
  userForms;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
  );

  constructor(public datepipe: DatePipe, private webReqService: WebRequestService, public dialog: MatDialog, private breakpointObserver: BreakpointObserver, private router: Router) {
    this.visiblePacjentPage = false;

    this.userForms = this.webReqService.getUserForms().toPromise().then((res) => {
      var dateNow = this.datepipe.transform(new Date(), 'M/d/YYYY');
      var lastUserList = this.datepipe.transform(res[Object.keys(res).length - 2].datetime, 'M/d/YYYY');
      
      if (dateNow != lastUserList) {
        this.numberOfNotifications += 1;
        this.isBadgeDisabled = false;
      }
      else
        this.isBadgeDisabled = true;
      
    });
  }

  hide() { this.visiblePacjentPage = false; }

  show() { this.visiblePacjentPage = true; }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
    });
    dialogRef.componentInstance.name = "nav";
  }

  async onLogoutButtonClicked()
  {
    await this.router.navigate(["/login"]);
    window.location.reload();
  }

}
