import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryTemplateSidebarComponent } from './salary-template-sidebar.component';

describe('SalaryTemplateSidebarComponent', () => {
  let component: SalaryTemplateSidebarComponent;
  let fixture: ComponentFixture<SalaryTemplateSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryTemplateSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryTemplateSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
