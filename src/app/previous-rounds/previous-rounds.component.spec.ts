import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousRoundsComponent } from './previous-rounds.component';

describe('PreviousRoundsComponent', () => {
  let component: PreviousRoundsComponent;
  let fixture: ComponentFixture<PreviousRoundsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviousRoundsComponent]
    });
    fixture = TestBed.createComponent(PreviousRoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
