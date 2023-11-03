import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentRoundsComponent } from './current-rounds.component';

describe('RoundsComponent', () => {
  let component: CurrentRoundsComponent;
  let fixture: ComponentFixture<CurrentRoundsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentRoundsComponent]
    });
    fixture = TestBed.createComponent(CurrentRoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
