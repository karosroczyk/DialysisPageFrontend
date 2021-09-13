export class WeatherDataFromWebsite {
  constructor(
    public date: Date,
    public temperature: number,
    public humidity: number,
    public windSpeed: number,
    public pressure: number,
    public isDay: boolean,
    public isCloudy: boolean,
    public city: String
  ) {}

}
