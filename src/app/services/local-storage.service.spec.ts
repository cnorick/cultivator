import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get items', () => {
    service.setItem('test_key', 'test_value');
    expect(service.getItem('test_key')).toBe('test_value');
  });

  it('should remove items', () => {
    service.setItem('test_key', 'test_value');
    service.removeItem('test_key');
    expect(service.getItem('test_key')).toBeNull();
  });

  it('should clear all items', () => {
    service.setItem('key1', 'val1');
    service.setItem('key2', 'val2');
    service.clearAll();
    expect(service.getItem('key1')).toBeNull();
    expect(service.getItem('key2')).toBeNull();
  });
});
