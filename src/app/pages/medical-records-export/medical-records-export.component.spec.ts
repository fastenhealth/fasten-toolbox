import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordsExportComponent } from './medical-records-export.component';

describe('MedicalRecordsExportComponent', () => {
  let component: MedicalRecordsExportComponent;
  let fixture: ComponentFixture<MedicalRecordsExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsExportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
