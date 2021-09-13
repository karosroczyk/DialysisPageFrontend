import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LekarzChatComponent } from './lekarz-chat.component';

describe('LekarzChatComponent', () => {
  let component: LekarzChatComponent;
  let fixture: ComponentFixture<LekarzChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LekarzChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LekarzChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
