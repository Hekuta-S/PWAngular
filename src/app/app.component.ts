import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataInputComponent } from './components/data-input/data-input.component';
import { IndexedDBService } from './services/indexeddb.service'; // Asegúrate de que el path es correcto
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TablatestComponent } from './components/tablatest/tablatest.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DataInputComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  saludo: string = '';
  items: any[] = [];
  private isSyncing = false;
  private onlineListener: (() => void) | null = null;

  constructor(
    private IndexedDBService: IndexedDBService,
    private http: HttpClient
  ) {}

  // Elimina la sincronización automática y el listener 'online' en AppComponent
  ngOnInit(): void {
    this.loadItemsFromApi();
    // No sincronización ni listener aquí
  }

  ngOnDestroy(): void {
    // No hace falta limpiar listeners aquí
  }

  // Sincroniza los datos guardados en IndexedDB cuando vuelve la conexión
  private async syncOfflineData() {
    const offlineData = await this.IndexedDBService.getAllData();
    if (offlineData && offlineData.length > 0) {
      try {
        // Enviar datos a la API
        await this.http.post<any[]>('http://localhost:8000/api/v1/items/import', offlineData).toPromise();
        // Borrar datos locales si la sincronización es exitosa
        for (const item of offlineData) {
          if (typeof item.id === 'number') {
            await this.IndexedDBService.deleteData(item.id);
          }
        }
        // No llamar a this.loadItemsFromApi();
      } catch (error) {
        alert('Error al sincronizar datos offline.');
        console.error(error);
      }
    }
  }

  loadItemsFromApi() {
    // Evita llamar a la API si no hay conexión
    if (!navigator.onLine) {
      this.items = [];
      return;
    }
    this.http.get<any[]>('http://localhost:8000/api/v1/items/').subscribe({
      next: (data) => this.items = data,
      error: (err) => {
        this.items = [];
        // Solo muestra el error si hay conexión
        if (navigator.onLine) {
          console.error('Error al cargar items desde la API', err);
        }
      }
    });
  }
}