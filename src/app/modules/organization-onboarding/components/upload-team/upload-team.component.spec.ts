import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTeamComponent } from './upload-team.component';

describe('UploadTeamComponent', () => {
  let component: UploadTeamComponent;
  let fixture: ComponentFixture<UploadTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadTeamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
