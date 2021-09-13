import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';
import { UserSignUpForm } from './UserSignUpForm';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }
  error;

  login(email: string, password: string) {
    var obj = this.webService.login(email, password).then(
      (res: HttpResponse<any>) => {
        if (res) {
          this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        }
        return res;
      }).then(error => this.error = error);
    return obj;
  }

  signup(email: string, password: string) {
    var obj = this.webService.signup(email, password).then(
      (res: HttpResponse<any>) => {
        if (res) {
          this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        }
        return res;
      }).then(error => this.error = error);
    return obj;
  }

  checkData(userSignUpForm) {
    var obj = this.webService.postUserSignUpForm('userSignUpForm', userSignUpForm).then(
      (res: HttpResponse<any>) => {
        if (res) {
          console.log("inside" + res.status);
        }
        return res;
      }).then(error => { this.error = error });
    return obj;
  }

  logout() {
    this.removeSession();
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  }

  getUserId() {
    return localStorage.getItem('user-id');
  }

  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getNewAccessToken() {
    return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken(),
        '_id': this.getUserId()
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>) => {
        this.setAccessToken(res.headers.get('x-access-token'));
      })
    )
  }
}
