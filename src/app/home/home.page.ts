import { ChangeDetectionStrategy, Component } from '@angular/core';

enum VALVE_OPTIONS {
  DEFAULT = 'default',
  CUSTOM = 'custom',
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styles: `
  app-custom-temperature-dragger {
    margin-top: -1.5rem;
    width: 100%;
    max-width: 300px;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  public valveOptions = VALVE_OPTIONS;
  public valveSelected: VALVE_OPTIONS = VALVE_OPTIONS.CUSTOM;
  public currentTemperature = 22;
  public isTemperatureOff: boolean = false;

  public hasSegmentChanges(value: CustomEvent): void {
    this.valveSelected = value.detail.value;
  }

  public hasTemperatureChanges(temperature: number): void {
    this.currentTemperature = temperature;
  }
}
