import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablatestComponent } from './tablatest.component';

describe('TablatestComponent', () => {
  let component: TablatestComponent;
  let fixture: ComponentFixture<TablatestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablatestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
