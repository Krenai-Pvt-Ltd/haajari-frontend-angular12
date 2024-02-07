import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaManagerCropComponent } from './media-manager-crop.component';

describe('MediaManagerCropComponent', () => {
  let component: MediaManagerCropComponent;
  let fixture: ComponentFixture<MediaManagerCropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaManagerCropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaManagerCropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
