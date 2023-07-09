import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MoreInfoComponent } from './more-info/more-info.component';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [TransactionsComponent, MoreInfoComponent],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ComponentsModule,
  ],
})
export class TransactionsModule {}
