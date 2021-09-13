export class UserSignUpForm {

  constructor(
    public email: string,
    public password: string,
    public gender: boolean,
    public birthday: Date,
    public firstDialysis: Date,
    public diabetes: boolean,
    public patient: boolean,
    public lekarz: string,
    public cityOfInterest: string,
    public dayOfInterest: Date
  ) { }

}
