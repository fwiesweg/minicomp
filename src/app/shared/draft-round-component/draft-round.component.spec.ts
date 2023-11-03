import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftRoundComponent } from './draft-round.component';

describe('DraftRoundComponent', () => {
  let component: DraftRoundComponent;
  let fixture: ComponentFixture<DraftRoundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DraftRoundComponent]
    });
    fixture = TestBed.createComponent(DraftRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
