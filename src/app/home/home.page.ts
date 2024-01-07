import { ChangeDetectionStrategy, Component } from '@angular/core';

enum VALVE_OPTIONS {
  DEFAULT = 'default',
  CUSTOM = 'custom',
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  public valveOptions = VALVE_OPTIONS;
  public valveSelected: VALVE_OPTIONS = VALVE_OPTIONS.DEFAULT;

  hasSegmentChanges(value: CustomEvent): void {
    this.valveSelected = value.detail.value;
  }
}
