import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-content-example-dialog',
  templateUrl: './dialog-content-example-dialog.component.html',
  styleUrls: ['./dialog-content-example-dialog.component.scss']
})
export class DialogContentExampleDialog implements OnInit {

  constructor() { }
  name: string;

  ngOnInit(): void {
  }

}
