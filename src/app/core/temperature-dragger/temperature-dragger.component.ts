import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-temperature-dragger',
  template: `
    <div class="valve">
      <div class="valve--min-marker" #minMarker></div>
      <div class="valve--max-marker" #maxMarker></div>
      <div class="valve__circle">
        <div class="valve__circle--temperature-marker" #temperatureMarker></div>
      </div>
    </div>

    <div class="temperature-display">
      <span class="temperature-display--label">{{ current }}°C</span>
    </div>
  `,
  styleUrls: ['./temperature-dragger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule],
})
export class TemperatureDraggerComponent implements AfterViewInit {
  @ViewChild('minMarker') minMarker: ElementRef | undefined;
  @ViewChild('maxMarker') maxMarker: ElementRef | undefined;
  @ViewChild('temperatureMarker') temperatureMarker: ElementRef | undefined;

  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() current: number = 16;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    if (this.min > this.max) {
      console.error('the minimum value must be less than the maximum');
      return;
    }
    this.initMarkerLimit(this.minMarker as ElementRef, this.min);
    this.initMarkerLimit(this.maxMarker as ElementRef, this.max);
    this.initMarkerLimit(this.temperatureMarker as ElementRef, this.current);
  }

  initMarkerLimit(marker: ElementRef, value: number) {
    const minDeg = Math.floor(Math.floor(value * 360) / 100) - 90;
    this.renderer.setStyle(
      marker.nativeElement,
      'transform',
      `rotate(${minDeg}deg)`
    );
  }
}
