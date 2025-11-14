import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TefcaIasExportComponent } from './tefca-ias-export.component';

describe('MedicalRecordsExportComponent', () => {
  let component: TefcaIasExportComponent;
  let fixture: ComponentFixture<TefcaIasExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TefcaIasExportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TefcaIasExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
