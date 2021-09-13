import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LekarzDashboardComponent } from './lekarz-dashboard.component';

describe('LekarzDashboardComponent', () => {
  let component: LekarzDashboardComponent;
  let fixture: ComponentFixture<LekarzDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LekarzDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LekarzDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
