import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-who',
  templateUrl: './signup-who.component.html',
  styleUrls: ['./signup-who.component.scss']
})
export class SignupWhoComponent implements OnInit {

  patientYesNo: string;
  patientChoice: string[] = ['Pacjent', 'Lekarz'];

  constructor(private router: Router) { }

  ngOnInit(): void {}

  onSignupButtonClicked() {
    if (this.patientYesNo === "Pacjent")
      this.router.navigate(['/signup', 1]);
    else
      this.router.navigate(['/signup', 0]);
  }
}
