import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDropAreaComponent } from './file-drop-area.component';

describe('FileDropAreaComponent', () => {
  let component: FileDropAreaComponent;
  let fixture: ComponentFixture<FileDropAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDropAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDropAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
