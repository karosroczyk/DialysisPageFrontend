export class LekarzSignUpForm {

  constructor(
    public email: string,
    public password: string,
    public gender: boolean,
    public birthday: Date,
    public patient: boolean,
    public patientsList: string[],
    public cityOfInterest: string,
    public dayOfInterest: Date
  ) { }

}
