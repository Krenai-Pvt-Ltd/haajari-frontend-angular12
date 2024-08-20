import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkExpiredPageComponent } from './link-expired-page.component';

describe('LinkExpiredPageComponent', () => {
  let component: LinkExpiredPageComponent;
  let fixture: ComponentFixture<LinkExpiredPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkExpiredPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkExpiredPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
