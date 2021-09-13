import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { SettingPageComponent } from './pages/setting-page/setting-page.component';
import { LekarzSettingPageComponent } from './lekarz-profile/lekarz-setting-page/lekarz-setting-page.component';
import { WebRequestService } from './web-request.service';
import { LekarzDashboardComponent } from './lekarz-profile/lekarz-dashboard/lekarz-dashboard.component';
import { NavComponent } from './nav/nav.component';
import { ChatInboxComponent } from './pages/chat-inbox/chat-inbox.component';
import { LekarzChatComponent } from './lekarz-profile/lekarz-chat/lekarz-chat.component';
import { SignupWhoComponent } from './pages/signup-who/signup-who.component';


const routes: Routes = [
  { path: 'login', component: LoginPageComponent, data: { header: false, patient: false } },
  { path: 'signupwho', component: SignupWhoComponent, data: { header: false, patient: false } },
  { path: 'signup/:id', component: SignupPageComponent, resolve: { usersListFromDB: WebRequestService }, data: { header: false, patient: false, resolvedata: 'doctorsList' } },
  { path: 'lists', component: UserFormComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: true, patient: false, resolvedata: 'userSignUpForm' } },
  { path: '', component: DashboardComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: true, patient: false, resolvedata: 'userForms' } },
  { path: 'dashboardlekarz', component: LekarzDashboardComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: false, patient: true, resolvedata: 'lekarzSignUpForm'} },
  { path: 'settings', component: SettingPageComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: true, patient: false, resolvedata: 'userSignUpForm' } },
  { path: 'settingslekarz', component: LekarzSettingPageComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: false, patient: true, resolvedata: 'lekarzSignUpForm' } },
  { path: 'chattolekarz', component: ChatInboxComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: true, patient: false, resolvedata: 'userSignUpForm'  } },
  { path: 'chattopacjent', component: LekarzChatComponent, resolve: { userFormFromDB: WebRequestService }, data: { header: false, patient: true, resolvedata: 'lekarzSignUpForm' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [WebRequestService, NavComponent]
})
export class AppRoutingModule { }
