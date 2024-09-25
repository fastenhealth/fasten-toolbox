import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordsExportCallbackComponent } from './medical-records-export-callback.component';

describe('MedicalRecordsExportCallbackComponent', () => {
  let component: MedicalRecordsExportCallbackComponent;
  let fixture: ComponentFixture<MedicalRecordsExportCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsExportCallbackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsExportCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
