import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../types/category';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private googleSheets = inject(GoogleSheetsService);


  public categories$ = (
    this.googleSheets.categoryData$ as unknown as Observable<Category[]>
  ).pipe(map((categories) => categories.filter((c) => !!c.category)));
}
