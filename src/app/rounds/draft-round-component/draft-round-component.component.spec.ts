import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftRoundComponentComponent } from './draft-round-component.component';

describe('DraftRoundComponentComponent', () => {
  let component: DraftRoundComponentComponent;
  let fixture: ComponentFixture<DraftRoundComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DraftRoundComponentComponent]
    });
    fixture = TestBed.createComponent(DraftRoundComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
