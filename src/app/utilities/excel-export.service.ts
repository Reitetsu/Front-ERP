import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }
  exportToExcel(data: any[], fileName: string, headersMapping: { [key: string]: string }): void {
    // Helper para obtener valores anidados a partir de una cadena tipo 'product_type.description_product_type'
    const getNestedValue = (obj: any, path: string): any => {
      const keys = path.split('.');
      let current = obj;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return current;
    };

    // Mapeamos los datos usando las llaves del headersMappingg
    const mappedData = data.map(item => {
      const mappedItem: { [key: string]: any } = {};
      for (const key in headersMapping) {
        const value = getNestedValue(item, key);
        if (value !== undefined) {
          mappedItem[headersMapping[key]] = value;
        }
      }
      return mappedItem;
    });

    // Convertimos los datos mapeados a una hoja de cálculo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}
