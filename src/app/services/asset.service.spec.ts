/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AssetService } from './asset.service';

describe('Service: Asset', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetService]
    });
  });

  it('should ...', inject([AssetService], (service: AssetService) => {
    expect(service).toBeTruthy();
  }));
});
