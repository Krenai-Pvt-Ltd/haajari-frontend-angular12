import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRegistrationFormComponent } from './organization-registration-form.component';

describe('OrganizationRegistrationFormComponent', () => {
  let component: OrganizationRegistrationFormComponent;
  let fixture: ComponentFixture<OrganizationRegistrationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationRegistrationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRegistrationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
