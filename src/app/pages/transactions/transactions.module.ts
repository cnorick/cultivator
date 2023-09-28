import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MoreInfoComponent } from './more-info/more-info.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { CategorySelectorPageComponent } from './more-info/category-selector-page/category-selector-page.component';
import { MatIconModule } from '@angular/material/icon';
import { InfoContainerComponent } from './more-info/info-container/info-container.component';
import { NotesComponent } from './more-info/notes/notes.component';
import { NewTransactionComponent } from './new-transaction/new-transaction.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    TransactionsComponent,
    MoreInfoComponent,
    CategorySelectorPageComponent,
    InfoContainerComponent,
    NotesComponent,
    NewTransactionComponent,
  ],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ComponentsModule,
    MatToolbarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class TransactionsModule {}
