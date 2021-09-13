import { Component, OnInit } from '@angular/core';
import { WebRequestService } from './../../web-request.service';
import { io } from 'socket.io-client';
import { HttpResponse } from '@angular/common/http';
import { LekarzSignUpForm } from '../../LekarzSignUpForm';
import { ActivatedRoute } from '@angular/router';
import { FileService } from './../../file.service';
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';

const SOCKET_ENDPOINT = 'https://dialysis-page-server.herokuapp.com';

@Component({
  selector: 'app-lekarz-chat',
  templateUrl: './lekarz-chat.component.html',
  styleUrls: ['./lekarz-chat.component.scss']
})
export class LekarzChatComponent implements OnInit {
  socket: any;
  message: string = "";

  lekarzDataFromSignUpForm: LekarzSignUpForm;
  selectedOptions;
  createdRooms = [];

  constructor(public dialog: MatDialog, private _fileService: FileService, private webReqService: WebRequestService, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.data.subscribe((res) => {
      this.lekarzDataFromSignUpForm = new LekarzSignUpForm(
        res.userFormFromDB[0][0].email,
        res.userFormFromDB[0][0].password,
        res.userFormFromDB[0][0].gender,
        res.userFormFromDB[0][0].birthday,
        res.userFormFromDB[0][0].patient,
        res.userFormFromDB[0][0].patientsList,
        res.userFormFromDB[0][0].cityOfInterest,
        res.userFormFromDB[0][0].dayOfInterest);
    })
  }

  ngOnInit(): void { }

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

        if ((data.room).includes(this.selectedOptions))
            myMaybeNullElement.appendChild(element);

        var objDiv = document.getElementById("scroll-bottom");
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    });

    this.socket.on('userforms-broadcast', (data) => {
      if (data)
        console.log(data)
    });

  }

  SendMessage() {
    var e = document.getElementById('message-list');
    e.innerHTML = "";

    this.socket.emit('message', this.message, this.lekarzDataFromSignUpForm.email, this.selectedOptions[0], this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions);

    this.webReqService.getMessages(this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions).toPromise().then(res => {

      for (let i = 0; i < Object.keys(res).length; i++) {

        const element = document.createElement('li');
        element.innerHTML = res[i].message;
        element.style.padding = '.4rem 1rem';
        element.style.webkitBorderRadius = '1';
        element.style.borderRadius = '4px';
        element.style.background = '#ffffff';
        element.style.fontWeight = '300';
        element.style.lineHeight = '50 %';
        element.style.position = 'relative';
        element.style.flexDirection = 'column';
        element.style.marginBottom = '10px';

        if (res[i].sender == this.lekarzDataFromSignUpForm.email) {
          element.style.textAlign = 'right';
          element.style.background = '#95B575';
          element.style.color = 'white';
        }

        const myMaybeNullElement = document.getElementById('message-list')

        if (myMaybeNullElement === null)
          alert('Null message object');
        else
          myMaybeNullElement.appendChild(element);

        var objDiv = document.getElementById("scroll-bottom");
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    });
      this.message = '';
  }

  onNgModelChange() {
    var e = document.getElementById('message-list');
    e.innerHTML = "";

    this.webReqService.get("lekarzSignUpForm").subscribe((res: HttpResponse<any>) => {

      if (this.createdRooms.indexOf(this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions) == -1) {
        this.setupSocketConnection();
        this.socket.emit('create', this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions);
        this.createdRooms.push(this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions);
      }

      this.webReqService.getMessages(this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions).toPromise().then(res => {

        for (let i = 0; i < Object.keys(res).length; i++) {

          const element = document.createElement('li');
          element.innerHTML = res[i].message;
          element.style.padding = '.4rem 1rem';
          element.style.webkitBorderRadius = '1';
          element.style.borderRadius = '4px';
          element.style.background = '#ffffff';
          element.style.fontWeight = '300';
          element.style.lineHeight = '50 %';
          element.style.position = 'relative';
          element.style.flexDirection = 'column';
          element.style.marginBottom = '10px';

          if (res[i].sender == this.lekarzDataFromSignUpForm.email) {
            element.style.textAlign = 'right';
            element.style.background = '#95B575';
            element.style.color = 'white';
          }

          const myMaybeNullElement = document.getElementById('message-list')

          if (myMaybeNullElement === null) {
            alert('Null message object');
          } else {
            myMaybeNullElement.appendChild(element);
          }

          var objDiv = document.getElementById("scroll-bottom");
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      });
    });
  }

  downloadFile() {
    var filename = this.lekarzDataFromSignUpForm.email + "_" + this.selectedOptions + ".pdf";

    this._fileService.downloadFile(filename)
      .subscribe(
        data => saveAs(data, filename),
        error => {
          console.error(error);

          if (!this.selectedOptions)
            this.openDialog(true)
          else
            this.openDialog(false)
        }
      );
  }

  openDialog(undefUser: boolean) {
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
    });

    if (undefUser)
      dialogRef.componentInstance.name = "undefUser";
    else
      dialogRef.componentInstance.name = "nofile";
  }
}
