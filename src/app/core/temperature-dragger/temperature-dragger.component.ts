import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-temperature-dragger',
  templateUrl: './temperature-dragger.component.html',
  styleUrls: ['./temperature-dragger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TemperatureDraggerComponent implements OnInit {
  @Input() min: number | undefined;
  @Input() max: number | undefined;
  @Input() current: number | undefined;

  constructor() {}

  ngOnInit() {
    console.log('min', this.min);
    console.log('max', this.max);
    console.log('current', this.current);
  }
}
