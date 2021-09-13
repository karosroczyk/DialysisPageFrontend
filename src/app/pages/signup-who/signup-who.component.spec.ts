import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupWhoComponent } from './signup-who.component';

describe('SignupWhoComponent', () => {
  let component: SignupWhoComponent;
  let fixture: ComponentFixture<SignupWhoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupWhoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupWhoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
