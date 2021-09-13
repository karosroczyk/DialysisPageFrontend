import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DatePipe } from '@angular/common'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { WebReqInterceptor } from './web-req.interceptor';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingPageComponent } from './pages/setting-page/setting-page.component';
import { LekarzDashboardComponent } from './lekarz-profile/lekarz-dashboard/lekarz-dashboard.component';
import { NavLekarzComponent } from './nav-lekarz/nav-lekarz.component';
import { LekarzSettingPageComponent } from './lekarz-profile/lekarz-setting-page/lekarz-setting-page.component';
import { ChatInboxComponent } from './pages/chat-inbox/chat-inbox.component';
import { LekarzChatComponent } from './lekarz-profile/lekarz-chat/lekarz-chat.component';
import { SignupWhoComponent } from './pages/signup-who/signup-who.component';
import { MatTableModule } from '@angular/material/table' 
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { GaugeChartModule } from 'angular-gauge-chart';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogContentExampleDialog } from './dialog-content-example-dialog/dialog-content-example-dialog.component';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    UserFormComponent,
    NavComponent,
    DashboardComponent,
    SignupPageComponent,
    SettingPageComponent,
    LekarzDashboardComponent,
    NavLekarzComponent,
    LekarzSettingPageComponent,
    ChatInboxComponent,
    LekarzChatComponent,
    SignupWhoComponent,
    DialogContentExampleDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
    MatTableModule,
    MatSelectModule,
    MatPaginatorModule,
    AmazingTimePickerModule,
    GaugeChartModule,
    MatBadgeModule,
    MatDialogModule,
    FileUploadModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
