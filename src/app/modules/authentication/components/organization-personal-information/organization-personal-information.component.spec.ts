import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationPersonalInformationComponent } from './organization-personal-information.component';

describe('OrganizationPersonalInformationComponent', () => {
  let component: OrganizationPersonalInformationComponent;
  let fixture: ComponentFixture<OrganizationPersonalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationPersonalInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationPersonalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
