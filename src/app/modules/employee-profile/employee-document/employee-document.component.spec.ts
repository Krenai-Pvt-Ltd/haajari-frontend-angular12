import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDocumentComponent } from './employee-document.component';

describe('EmployeeDocumentComponent', () => {
  let component: EmployeeDocumentComponent;
  let fixture: ComponentFixture<EmployeeDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
