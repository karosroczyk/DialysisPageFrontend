import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LekarzSettingPageComponent } from './lekarz-setting-page.component';

describe('LekarzSettingPageComponent', () => {
  let component: LekarzSettingPageComponent;
  let fixture: ComponentFixture<LekarzSettingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LekarzSettingPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LekarzSettingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
