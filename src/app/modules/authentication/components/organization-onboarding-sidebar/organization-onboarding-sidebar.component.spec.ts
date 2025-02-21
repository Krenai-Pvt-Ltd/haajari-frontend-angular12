import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationOnboardingSidebarComponent } from './organization-onboarding-sidebar.component';

describe('OrganizationOnboardingSidebarComponent', () => {
  let component: OrganizationOnboardingSidebarComponent;
  let fixture: ComponentFixture<OrganizationOnboardingSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationOnboardingSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationOnboardingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
