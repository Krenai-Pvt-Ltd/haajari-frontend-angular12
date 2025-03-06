import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningDetailsComponent } from './earning-details.component';

describe('EarningDetailsComponent', () => {
  let component: EarningDetailsComponent;
  let fixture: ComponentFixture<EarningDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EarningDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EarningDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
