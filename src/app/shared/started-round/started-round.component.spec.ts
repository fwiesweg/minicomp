import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartedRoundComponent } from './started-round.component';

describe('formGroup', () => {
  let component: StartedRoundComponent;
  let fixture: ComponentFixture<StartedRoundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StartedRoundComponent]
    });
    fixture = TestBed.createComponent(StartedRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
