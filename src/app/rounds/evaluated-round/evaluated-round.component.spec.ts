import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatedRoundComponent } from './evaluated-round.component';

describe('EvaluatedRoundComponent', () => {
  let component: EvaluatedRoundComponent;
  let fixture: ComponentFixture<EvaluatedRoundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvaluatedRoundComponent]
    });
    fixture = TestBed.createComponent(EvaluatedRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
