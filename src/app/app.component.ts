import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DropdownModule, ChartModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  data: any[] = [];
  columns: any[] = [];
  columnInfo: any[] = [];  // Nueva tabla para mostrar la información de las columnas
  analysisResults: any;
  selectedColumn: number = 0;
  chartOptions: any;
  chartType: 'pie' | 'bar' | 'line' | 'scatter' | 'bubble' | 'doughnut' | 'polarArea' | 'radar' | undefined = undefined;

  chartTypes = [
    { label: 'Seleccionar', value: '' },
    { label: 'Torta', value: 'pie' },
    { label: 'Barras', value: 'bar' },
    { label: 'Línea', value: 'line' },
    { label: 'Dispersión', value: 'scatter' },
    { label: 'Burbuja', value: 'bubble' },
    { label: 'Dona', value: 'doughnut' },
    { label: 'Área Polar', value: 'polarArea' },
    { label: 'Radar', value: 'radar' }
  ];

  // Opciones de visualización del gráfico
  chartDisplayOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: { size: 14 }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    },
    scales: {
      x: { grid: { color: '#e0e0e0' }, ticks: { color: '#333' } },
      y: { grid: { color: '#e0e0e0' }, ticks: { color: '#333' } }
    },
    backgroundColor: '#f5f5f5'
  };

  ngOnInit(): void {
    this.chartType = undefined;

  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      console.error("Por favor selecciona solo un archivo");
      return;
    }

    const file = target.files[0];
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      alert("Por favor, sube un archivo en formato CSV o XLSX");
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (this.data.length > 1) {
        this.columns = this.data[0].map((header: string, index: number) => ({
          field: index,
          header: header
        }));
        this.data = this.data.slice(1);
        this.generateColumnInfo();  // Genera la información de las columnas después de cargar los datos
      } else {
        alert("El archivo no contiene datos o está vacío.");
      }
    };
    reader.readAsBinaryString(file);
  }

  generateColumnInfo() {
    this.columnInfo = this.columns.map(col => {
      const colData = this.data.map(row => row[col.field]);

      // Contar valores no nulos
      const nonNullCount = colData.filter(value => value !== null && value !== undefined).length;

      // Determinar el tipo de dato dominante
      const isNumeric = colData.every(value => value === null || value === undefined || !isNaN(Number(value)));
      const dtype = isNumeric ? 'Numeric' : 'Text';

      return {
        column: col.header,
        nonNullCount: nonNullCount,
        dtype: dtype
      };
    });
  }

  runAnalysis(columnIndex: number) {
    if (!this.data || this.data.length < 1) {
      console.error("No hay datos para analizar.");
      return;
    }

    const numericData = this.data
      .map(row => +row[columnIndex])
      .filter(value => !isNaN(value));

    if (numericData.length === 0) {
      console.error("No hay datos numéricos válidos en la columna seleccionada.");
      return;
    }

    const max = Math.max(...numericData);
    const min = Math.min(...numericData);
    const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;

    this.analysisResults = { max, min, mean };
    console.log("Resultado del análisis:", this.analysisResults);
  }

  generateChart() {
    if (!this.data || this.data.length < 1) {
      console.error("No hay datos para graficar.");
      return;
    }
    if (!this.chartType) {
      console.log("Por favor selecciona un tipo de gráfico válido.");
      return;
    }

    const selectedData = this.data.map(row => row[this.selectedColumn]).filter(value => !isNaN(value));

    this.chartOptions = {
      labels: this.data.map((_, index) => `Fila ${index + 1}`),
      datasets: [
        {
          label: 'Datos de la columna seleccionada',
          data: selectedData,
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#FF6384', '#36A2EB', '#FFCE56']
        }
      ]
    };
  }
}
