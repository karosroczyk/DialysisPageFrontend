import { Component, OnInit } from '@angular/core';
import { WebRequestService } from './../../web-request.service';
import { io } from 'socket.io-client';
import { HttpResponse } from '@angular/common/http';
import { UserSignUpForm } from '../../UserSignUpForm';
import { ActivatedRoute } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './../../dialog-content-example-dialog/dialog-content-example-dialog.component';

const SOCKET_ENDPOINT = 'https://dialysis-page-server.herokuapp.com';
const uri = 'https://dialysis-page-server.herokuapp.com/file/upload';

@Component({
  selector: 'app-chat-inbox',
  templateUrl: './chat-inbox.component.html',
  styleUrls: ['./chat-inbox.component.scss']
})
export class ChatInboxComponent implements OnInit{
  socket: any;
  message: string = "";

  private userDataFromSignUpForm: UserSignUpForm;

  uploader: FileUploader = new FileUploader({ url: uri, headers: [{ name: 'Authorization', value: 'Bearer ejy...' }]});
  attachmentList: any = [];

  constructor(public dialog: MatDialog, private webReqService: WebRequestService, private activatedRoute: ActivatedRoute) {
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

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if(status === 200)
        this.openDialog(true);
      else
        this.openDialog(false);
      this.attachmentList.push(JSON.parse(response));
    }

    this.uploader.onAfterAddingFile = (file) => {
      file.file.name = this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email + ".pdf";
    };
  }

  ngOnInit() {
    this.webReqService.get("userSignUpForm").subscribe((res: HttpResponse<any>) => {
      this.setupSocketConnection();
      this.socket.emit('create', this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email);
      this.webReqService.getMessages(this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email).toPromise().then(res => {

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

          if (res[i].sender == this.userDataFromSignUpForm.email) {
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
    });
  }

  openDialog(success: boolean) {
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
    });

    if (success)
      dialogRef.componentInstance.name = "upload-file";
    else
      dialogRef.componentInstance.name = "notupload-file";
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

        if (myMaybeNullElement === null) {
          alert('Null message object');
        } else {
          myMaybeNullElement.appendChild(element);
        }

        var objDiv = document.getElementById("scroll-bottom");
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    });
  }

  SendMessage() {
    var e = document.getElementById('message-list');
    e.innerHTML = "";

    this.socket.emit('message', this.message, this.userDataFromSignUpForm.email, this.userDataFromSignUpForm.lekarz, this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email);

    this.webReqService.getMessages(this.userDataFromSignUpForm.lekarz + "_" + this.userDataFromSignUpForm.email).toPromise().then(res => {
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

        if (res[i].sender == this.userDataFromSignUpForm.email) {
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
}
