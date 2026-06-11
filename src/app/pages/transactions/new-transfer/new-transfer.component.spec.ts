import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTransferComponent } from './new-transfer.component';

describe('NewTransferComponent', () => {
  let component: NewTransferComponent;
  let fixture: ComponentFixture<NewTransferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewTransferComponent]
    });
    fixture = TestBed.createComponent(NewTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
