import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {
  CustomTemperatureDraggerComponent,
  TemperatureDraggerComponent,
} from '@core';

@NgModule({
  declarations: [HomePage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    TemperatureDraggerComponent,
    CustomTemperatureDraggerComponent,
  ],
})
export class HomePageModule {}
