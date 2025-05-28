import { TestBed } from '@angular/core/testing';

import { IndexedDBService } from './indexeddb.service';

describe('IndexeddbService', () => {
  let service: IndexedDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
