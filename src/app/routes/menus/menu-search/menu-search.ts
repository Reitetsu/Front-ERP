import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MenuSearchDto } from 'src/app/models/menu';

@Component({
  selector: 'app-menu-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './menu-search.html',
  styleUrls: ['../menu-add/menu-add.scss'],
})
export class MenuSearchComponent {
  private readonly fb = inject(FormBuilder);

  @Output() search = new EventEmitter<MenuSearchDto>();
  @Output() close = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    code_Menu: [0],
    name_Menu: [''],
    description_Menu: [''],
    price_Menu: [0],
  });

  onSearch(): void {
    const v = this.form.getRawValue();

    const dto: MenuSearchDto = {
      code_Menu: v.code_Menu > 0 ? Number(v.code_Menu) : undefined,
      name_Menu: this.clean(v.name_Menu),
      description_Menu: this.clean(v.description_Menu),
      price_Menu: v.price_Menu > 0 ? Number(v.price_Menu) : undefined,
    };

    this.search.emit(dto);
  }

  onReset(): void {
    this.form.reset({
      code_Menu: 0,
      name_Menu: '',
      description_Menu: '',
      price_Menu: 0,
    });
  }

  onClose(): void {
    this.close.emit();
  }

  private clean(value: string): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
