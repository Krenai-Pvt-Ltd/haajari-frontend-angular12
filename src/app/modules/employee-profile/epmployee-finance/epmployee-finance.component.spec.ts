import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpmployeeFinanceComponent } from './epmployee-finance.component';

describe('EpmployeeFinanceComponent', () => {
  let component: EpmployeeFinanceComponent;
  let fixture: ComponentFixture<EpmployeeFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpmployeeFinanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpmployeeFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
