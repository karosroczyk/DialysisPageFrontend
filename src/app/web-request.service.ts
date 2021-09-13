import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserForm } from './UserForm';
import { UserSignUpForm } from './UserSignUpForm';
import { LekarzSignUpForm } from './LekarzSignUpForm';
import { HttpErrorResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { forkJoin } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class WebRequestService implements Resolve<any> {

  readonly ROOT_URL;

  constructor(private http: HttpClient) {
    this.ROOT_URL = 'https://dialysis-page-server.herokuapp.com';
  }

  get(uri: string) {
    return this.http.get(`${this.ROOT_URL}/${uri}`);
  }

  getMessages(room: string,) {
    return this.http.get(`${this.ROOT_URL}/messagesList/${room}`);
  }

  getDoctorsList() {
    return this.http.get(`${this.ROOT_URL}/doctorsList`);
  }

  getPatientsList() {
    return this.http.get(`${this.ROOT_URL}/doctorsList/0`);
  }

  getUserForms() {
    return this.http.get(`${this.ROOT_URL}/userForms`);
  }

  getLekarzSignUpForm() {
    return this.http.get(`${this.ROOT_URL}/lekarzSignUpForm`);
  }

  deleteLastPrediction(index) {
    return this.http.delete(`${this.ROOT_URL}/lists/${index}`);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (route.data['resolvedata'] == "doctorsList")
      return this.http.get(`${this.ROOT_URL}/${route.data['resolvedata']}/${route.params['id']}`);
    if (route.data['resolvedata'] == "userSignUpForm") {
      return forkJoin([
        this.http.get(`${this.ROOT_URL}/${route.data['resolvedata']}`),
        this.http.get(`${this.ROOT_URL}/doctorsList/1`)])
    }
    if (route.data['resolvedata'] == "lekarzSignUpForm") {
      return forkJoin([
        this.http.get(`${this.ROOT_URL}/${route.data['resolvedata']}`),
        this.http.get(`${this.ROOT_URL}/doctorsList/0`)])
    }
    if (route.data['resolvedata'] == "userForms") {
      return forkJoin([
        this.http.get(`${this.ROOT_URL}/${route.data['resolvedata']}`),
        this.http.get(`${this.ROOT_URL}/userSignUpForm`)])
    }

    return this.http.get(`${this.ROOT_URL}/${route.data['resolvedata']}`);
  }

  postUserForm(uri: string, _userForm: UserForm) {
    return this.http.post(`${this.ROOT_URL}/${uri}`, {
      "weight_start": _userForm.weight_start,
      "body_temperature": _userForm.body_temperature,
      "sbp": _userForm.sbp,
      "dbp": _userForm.dbp,
      "dia_temp_value": _userForm.dia_temp_value,
      "conductivity": _userForm.conductivity,
      "uf": _userForm.uf,
      "blood_flow": _userForm.blood_flow,
      "dialysis_time": _userForm.dialysis_time,
      "datetime": _userForm.datetime,
      "result_sbp": _userForm.result_sbp,
      "result_dbp": _userForm.result_dbp
    }, {
      observe: 'response'
    }).toPromise().catch(this.handleError);
  }

  postUserSignUpForm(uri: string, _userForm: UserSignUpForm) {
    return this.http.post(`${this.ROOT_URL}/${uri}`, {
      "email": _userForm.email,
      "password": _userForm.password,
      "gender": _userForm.gender,
      "birthday": _userForm.birthday,
      "firstDialysis": _userForm.firstDialysis,
      "diabetes": _userForm.diabetes,
      "patient": _userForm.patient,
      "lekarz": _userForm.lekarz,
      "cityOfInterest": _userForm.cityOfInterest,
      "dayOfInterest": _userForm.dayOfInterest
    }, {
      observe: 'response'
    }).toPromise().catch(this.handleError);
  }

  postLekarzSignUpForm(uri: string, _userForm: LekarzSignUpForm) {
    return this.http.post(`${this.ROOT_URL}/${uri}`, {
      "email": _userForm.email,
      "password": _userForm.password,
      "gender": _userForm.gender,
      "birthday": _userForm.birthday,
      "patient": _userForm.patient,
      "patientsList": _userForm.patientsList,
      "cityOfInterest": _userForm.cityOfInterest,
      "dayOfInterest": _userForm.dayOfInterest
    }, {
      observe: 'response'
    }).toPromise().catch(this.handleError);
  }

  patchUserSignUpForm(uri: string, id: string, _userForm: UserSignUpForm) {
    return this.http.patch(`${this.ROOT_URL}/${uri}/${id}`, {
      "email": _userForm.email,
      "password": _userForm.password,
      "gender": _userForm.gender,
      "birthday": _userForm.birthday,
      "firstDialysis": _userForm.firstDialysis,
      "diabetes": _userForm.diabetes,
      "patient": _userForm.patient,
      "lekarz": _userForm.lekarz,
      "cityOfInterest": _userForm.cityOfInterest,
      "dayOfInterest": _userForm.dayOfInterest
    });
  }

  patchLekarzSignUpForm(uri: string, id: string, _userForm: LekarzSignUpForm) {
    return this.http.patch(`${this.ROOT_URL}/${uri}/${id}`, {
      "email": _userForm.email,
      "password": _userForm.password,
      "gender": _userForm.gender,
      "birthday": _userForm.birthday,
      "patient": _userForm.patient,
      "patientsList": _userForm.patientsList,
      "cityOfInterest": _userForm.cityOfInterest,
      "dayOfInterest": _userForm.dayOfInterest
    });
  }

  patchUser(uri: string, id: string, _userForm) {
    return this.http.patch(`${this.ROOT_URL}/${uri}/${id}`, {
      "email": _userForm.email,
      "password": _userForm.password
    });
  }

  delete(uri: string) {
    return this.http.delete(`${this.ROOT_URL}/${uri}`);
  }

  handleError(error: HttpErrorResponse) {
    return false;
  }

  login(email: string, password: string) {
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email,
      password
    }, {
      observe: 'response'
    }).toPromise().catch(this.handleError);
  }

  signup(email: string, password: string) {
    return this.http.post(`${this.ROOT_URL}/users`, {
      email,
      password
    }, {
      observe: 'response'
    }).toPromise().catch(this.handleError);
  }

}
