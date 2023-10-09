import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugComponent } from './debug.component';
import { DebugRoutingModule } from './debug-routing.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DebugComponent],
  imports: [CommonModule, DebugRoutingModule, MatButtonModule],
  bootstrap: [DebugComponent],
})
export class DebugModule {}
