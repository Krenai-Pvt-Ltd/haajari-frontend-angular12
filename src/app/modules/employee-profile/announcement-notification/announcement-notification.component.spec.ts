import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementNotificationComponent } from './announcement-notification.component';

describe('AnnouncementNotificationComponent', () => {
  let component: AnnouncementNotificationComponent;
  let fixture: ComponentFixture<AnnouncementNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncementNotificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
