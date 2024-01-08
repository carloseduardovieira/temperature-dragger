import { LocationStrategy, Location, CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';

let uniqueId = 0;
const VIEW_BOX_SIZE = 300;

interface ValveStyle {
  viewBox: string;
  arcTranslateStr: string;
  clipPathStr: string;
  gradArcs: { color: string; d: string }[];
  nonSelectedArc: {
    color: string;
    d: string;
  };
  thumbPosition: { x: number; y: number };
  blurRadius: number;
}

@Component({
  selector: 'app-custom-temperature-dragger',
  templateUrl: './custom-temperature-dragger.component.html',
  styleUrls: ['./custom-temperature-dragger.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class CustomTemperatureDraggerComponent implements AfterViewInit {
  @ViewChild('svgRoot', { static: true }) svgRoot: ElementRef | undefined;

  @Input() fillColors: string = 'var(--ion-color-primary)';
  @Input() disableArcColor: any;
  @Input() arcThickness: number = 18; // CSS pixels
  @Input() thumbRadius: number = 16; // CSS pixels
  @Input() thumbBorder: number = 3;
  @Input() thumbBg: string = 'var(--ion-color-primary)'; // CSS color
  @Input() thumbBorderColor: string = 'var(--ion-color-light)'; // CSS color
  @Input() value: number = 22; // current value
  @Input() min: number = 0; // min output value
  @Input() max: number = 100; // max output value
  @Input() step: number = 0.1;

  @Output() valueChange = new EventEmitter<Number>();
  @Output() power = new EventEmitter<boolean>();

  public oldValue: number;
  public position: number = 0;
  public bottomAngle: number = 90;
  public off: boolean = false;
  public svgControlId: number = uniqueId++;
  public scaleFactor = 1;
  public bottomAngleRad = 0;
  public radius = 100;
  public translateXValue = 0;
  public translateYValue = 0;
  public thickness = 6;
  public pinRadius = 10;
  public colors: any = [];

  public styles: ValveStyle = {
    viewBox: '0 0 300 300',
    arcTranslateStr: 'translate(0, 0)',
    clipPathStr: '',
    gradArcs: [],
    nonSelectedArc: {
      color: '',
      d: '',
    },
    thumbPosition: { x: 0, y: 0 },
    blurRadius: 15,
  };

  constructor(
    private location: Location,
    private locationStrategy: LocationStrategy
  ) {
    this.oldValue = this.value;
  }

  ngAfterViewInit(): void {
    this.invalidate();

    if (this.min > this.value) {
      this.value = this.min;
    }

    setTimeout(() => {
      this.recalculateValvePosition(this.value);
    });
  }

  public valveChanges(evt: CustomEvent) {
    this.recalculateValvePosition(evt.detail.value);
  }

  public switchPower() {
    this.off = !this.off;
    this.power.emit(!this.off);

    if (this.off) {
      this.oldValue = this.value;
      this.value = this.min;
    } else {
      this.value = this.oldValue;
    }

    this.invalidatePinPosition();
  }

  public getUrlPath(id: string) {
    const baseHref = this.locationStrategy.getBaseHref().replace(/\/$/, '');
    const path = this.location.path().replace(/\/$/, '');
    return `url(${baseHref}${path}${id}${this.svgControlId})`;
  }

  private invalidate(): void {
    this.bottomAngleRad = CustomTemperatureDraggerComponent.toRad(
      this.bottomAngle
    );
    this.calculateVars();

    this.invalidateClipPathStr();
    this.invalidatePinPosition();

    setTimeout(() => {
      this.invalidateGradientArcs();
    });
  }

  private calculateVars() {
    this.bottomAngleRad = CustomTemperatureDraggerComponent.toRad(
      this.bottomAngle
    );
    this.colors = [this.fillColors];

    const halfAngle = this.bottomAngleRad / 2;

    const svgBoundingRect = this.svgRoot?.nativeElement.getBoundingClientRect();
    const svgAreaFactor =
      (svgBoundingRect.height &&
        svgBoundingRect.width / svgBoundingRect.height) ||
      1;
    const svgHeight = VIEW_BOX_SIZE / svgAreaFactor;
    const thumbMaxRadius = this.thumbRadius + this.thumbBorder;
    const thumbMargin =
      2 * thumbMaxRadius > this.arcThickness
        ? (thumbMaxRadius - this.arcThickness / 2) / this.scaleFactor
        : 0;

    this.scaleFactor = svgBoundingRect.width / VIEW_BOX_SIZE || 1;
    this.styles.viewBox = `0 0 ${VIEW_BOX_SIZE} ${svgHeight}`;

    const circleFactor =
      this.bottomAngleRad <= Math.PI
        ? 2 / (1 + Math.cos(halfAngle))
        : (2 * Math.sin(halfAngle)) / (1 + Math.cos(halfAngle));
    if (circleFactor > svgAreaFactor) {
      if (this.bottomAngleRad > Math.PI) {
        this.radius =
          (VIEW_BOX_SIZE - 2 * thumbMargin) / (2 * Math.sin(halfAngle));
      } else {
        this.radius = VIEW_BOX_SIZE / 2 - thumbMargin;
      }
    } else {
      this.radius = (svgHeight - 2 * thumbMargin) / (1 + Math.cos(halfAngle));
    }

    this.translateXValue = VIEW_BOX_SIZE / 2 - this.radius;
    this.translateYValue =
      svgHeight / 2 - (this.radius * (1 + Math.cos(halfAngle))) / 2;

    this.styles.arcTranslateStr = `translate(${this.translateXValue}, ${this.translateYValue})`;

    this.thickness = this.arcThickness / this.scaleFactor;
    this.pinRadius = this.thumbRadius / this.scaleFactor;
  }

  private calculateClipPathSettings() {
    const halfAngle = this.bottomAngleRad / 2;
    const innerRadius = this.radius - this.thickness;

    const xStartMultiplier = 1 - Math.sin(halfAngle);
    const yMultiplier = 1 + Math.cos(halfAngle);
    const xEndMultiplier = 1 + Math.sin(halfAngle);

    return {
      outer: {
        start: {
          x: xStartMultiplier * this.radius,
          y: yMultiplier * this.radius,
        },
        end: {
          x: xEndMultiplier * this.radius,
          y: yMultiplier * this.radius,
        },
        radius: this.radius,
      },
      inner: {
        start: {
          x: xStartMultiplier * innerRadius + this.thickness,
          y: yMultiplier * innerRadius + this.thickness,
        },
        end: {
          x: xEndMultiplier * innerRadius + this.thickness,
          y: yMultiplier * innerRadius + this.thickness,
        },
        radius: innerRadius,
      },
      thickness: this.thickness,
      big: this.bottomAngleRad < Math.PI ? '1' : '0',
    };
  }

  private invalidateClipPathStr() {
    const s = this.calculateClipPathSettings();

    let path = `M ${s.outer.start.x},${s.outer.start.y}`; // Start at startangle top

    // Outer arc
    // Draw an arc of radius 'radius'
    // Arc details...
    path += ` A ${s.outer.radius},${s.outer.radius}
       0 ${s.big} 1
       ${s.outer.end.x},${s.outer.end.y}`; // Arc goes to top end angle coordinate

    // Outer to inner connector
    path += ` A ${s.thickness / 2},${s.thickness / 2}
       0 1 1
       ${s.inner.end.x},${s.inner.end.y}`;

    // Inner arc
    path += ` A ${s.inner.radius},${s.inner.radius}
       1 ${s.big} 0
       ${s.inner.start.x},${s.inner.start.y}`;

    // Outer to inner connector
    path += ` A ${s.thickness / 2},${s.thickness / 2}
       0 1 1
       ${s.outer.start.x},${s.outer.start.y}`;

    // Close path
    path += ' Z';
    this.styles.clipPathStr = path;
  }

  private calculateGradientConePaths(angleStep: number) {
    const radius = this.radius;

    function calcX(angle: number) {
      return radius * (1 - 2 * Math.sin(angle));
    }

    function calcY(angle: number) {
      return radius * (1 + 2 * Math.cos(angle));
    }

    const gradArray = [];

    for (
      let i = 0, currentAngle = this.bottomAngleRad / 2;
      i < this.colors.length;
      i++, currentAngle += angleStep
    ) {
      gradArray.push({
        start: { x: calcX(currentAngle), y: calcY(currentAngle) },
        end: {
          x: calcX(currentAngle + angleStep),
          y: calcY(currentAngle + angleStep),
        },
        big: Math.PI <= angleStep ? 1 : 0,
      });
    }
    return gradArray;
  }

  private invalidateGradientArcs() {
    const radius = this.radius;

    function getArc(des: { start: any; end: any; big: any }) {
      return `M ${radius},${radius}
         L ${des.start.x},${des.start.y}
         A ${2 * radius},${2 * radius}
         0 ${des.big} 1
         ${des.end.x},${des.end.y}
         Z`;
    }

    const angleStep = (2 * Math.PI - this.bottomAngleRad) / this.colors.length;
    const s = this.calculateGradientConePaths(angleStep);

    this.styles.gradArcs = [];
    for (let i = 0; i < s.length; i++) {
      const si = s[i];
      const arcValue = getArc(si);

      this.styles.gradArcs.push({ color: this.colors[i], d: arcValue });
    }

    this.styles.blurRadius = 2 * radius * Math.sin(angleStep / 6);
  }

  private invalidateNonSelectedArc() {
    const angle =
      this.bottomAngleRad / 2 +
      (1 - this.getValuePercentage()) * (2 * Math.PI - this.bottomAngleRad);

    this.styles.nonSelectedArc = {
      color: this.disableArcColor,
      d: `M ${this.radius},${this.radius}
       L ${this.radius},${3 * this.radius}
       A ${2 * this.radius},${2 * this.radius}
       1 ${angle > Math.PI ? '1' : '0'} 0
       ${this.radius + this.radius * 2 * Math.sin(angle)},${
        this.radius + this.radius * 2 * Math.cos(angle)
      }
       Z`,
    };
  }

  private invalidatePinPosition() {
    const radiusOffset = this.thickness / 2;
    const curveRadius = this.radius - radiusOffset;
    const actualAngle =
      (2 * Math.PI - this.bottomAngleRad) * this.getValuePercentage() +
      this.bottomAngleRad / 2;
    this.styles.thumbPosition = {
      x: curveRadius * (1 - Math.sin(actualAngle)) + radiusOffset,
      y: curveRadius * (1 + Math.cos(actualAngle)) + radiusOffset,
    };
    this.invalidateNonSelectedArc();
  }

  private recalculateValvePosition(position: number) {
    this.value = position;
    this.valueChange.emit(position);
    this.invalidatePinPosition();
  }

  private getValuePercentage() {
    return (this.value - this.min) / (this.max - this.min);
  }

  private static toRad(angle: number) {
    return (Math.PI * angle) / 180;
  }
}
