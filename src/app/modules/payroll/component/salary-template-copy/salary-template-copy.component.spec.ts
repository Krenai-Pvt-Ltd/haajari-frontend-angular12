import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryTemplateCopyComponent } from './salary-template-copy.component';

describe('SalaryTemplateCopyComponent', () => {
  let component: SalaryTemplateCopyComponent;
  let fixture: ComponentFixture<SalaryTemplateCopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryTemplateCopyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryTemplateCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
