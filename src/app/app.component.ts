import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router'
import { filter, map, mergeMap, subscribeOn } from 'rxjs/operators';
import { FileService } from './file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [FileService]
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }
  visiblePacjentPage: boolean = false;
  visibleLekarzPage: boolean = false;

  ngOnInit() {
    this.router.events.pipe(
      filter(events => events instanceof NavigationEnd),
      map(evt => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }))
      .pipe(
        filter(route => route.outlet === "primary"),
        mergeMap(route => route.data)
    ).subscribe(x => x.header === true ? this.visiblePacjentPage = true : this.visiblePacjentPage = false);

    this.router.events.pipe(
      filter(events => events instanceof NavigationEnd),
      map(evt => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }))
      .pipe(
        filter(route => route.outlet === "primary"),
        mergeMap(route => route.data)
    ).subscribe(x => x.patient === true ? this.visibleLekarzPage = true : this.visibleLekarzPage = false)
  }
}
