export class UserForm {

  constructor(
    public weight_start: number,
    public body_temperature: number,
    public sbp: number,
    public dbp: number,
    public dia_temp_value: number,
    public conductivity: number,
    public uf: number,
    public blood_flow: number,
    public dialysis_time: number,
    public datetime: Date,
    public result_sbp: number,
    public result_dbp: number
  ) {  }

}
