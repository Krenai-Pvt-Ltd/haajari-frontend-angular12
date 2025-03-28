import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryTemplateComponent } from './salary-template.component';

describe('SalaryTemplateComponent', () => {
  let component: SalaryTemplateComponent;
  let fixture: ComponentFixture<SalaryTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
