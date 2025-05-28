import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { IndexedDBService } from '../../services/indexeddb.service';
import { CommonModule } from '@angular/common'; 
import { LucideAngularModule } from 'lucide-angular';
import { icons } from 'lucide-angular';
@Component({
  selector: 'app-data-input',
  standalone: true, // 👈 Esto indica que es standalone
  imports: [FormsModule, CommonModule], // 👈 Agrego CommonModule para directivas ngIf y ngFor
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.css']
})
export class DataInputComponent implements OnInit, OnDestroy {
  nombre = '';
  email = '';
  mensaje = '';
  @Input() items: any[] = [];

  // Nuevas variables para el popup
  showPopup = false;
  popupMessage = '';

  constructor(private indexedDBService: IndexedDBService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadItemsFromApi();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        await this.syncOfflineData();
        this.loadItemsFromApi();
      });
    }
  }

  ngOnDestroy(): void {
    // No hace falta limpiar listeners aquí
  }

  async onSubmit() {
    if (!this.nombre.trim() || !this.mensaje.trim()) {
      this.popupMessage = 'Por favor completa todos los campos.';
      this.showPopup = true;
      setTimeout(() => { this.showPopup = false; }, 2000);
      return;
    }
    const data = {
      title: this.nombre,
      description: this.mensaje,
      synced: false
    };
    try {
      await this.indexedDBService.addData(data);
      this.popupMessage = 'Datos guardados localmente en IndexedDB.';
      this.showPopup = true;
      setTimeout(() => { this.showPopup = false; }, 2000);
      this.nombre = '';
      this.email = '';
      this.mensaje = '';
      // Si hay internet, sincroniza los datos offline y recarga la lista
      if (navigator.onLine) {
        await this.syncOfflineData();
        this.loadItemsFromApi();
      }
    } catch (error) {
      this.popupMessage = 'Error al guardar datos offline.';
      this.showPopup = true;
      setTimeout(() => { this.showPopup = false; }, 2000);
      console.error(error);
    }
  }

  // Sincroniza los datos guardados en IndexedDB con el backend
  private async syncOfflineData() {
    const offlineData = await this.indexedDBService.getAllData();
    if (offlineData && offlineData.length > 0) {
      try {
        await this.http.post<any[]>('http://localhost:8000/api/v1/items/import', offlineData).toPromise();
        for (const item of offlineData) {
          if (typeof item.id === 'number') {
            await this.indexedDBService.deleteData(item.id);
          }
        }
      } catch (error) {
        alert('Error al sincronizar datos offline.');
        console.error(error);
      }
    }
  }

  loadItemsFromApi() {
  if (!navigator.onLine) {
    this.items = [];
    this.setPaginatedItems(); // Actualiza la vista también offline
    return;
  }
  this.http.get<any[]>('http://localhost:8000/api/v1/items/').subscribe({
    next: (data) => {
      this.items = data;
      this.currentPage = 1;
      this.setPaginatedItems();
    },
    error: (err) => {
      this.items = [];
      this.setPaginatedItems();
      if (navigator.onLine) {
        console.error('Error al cargar items desde la API', err);
      }
    }
  });
}



// Nuevas propiedades para paginación
paginatedItems: any[] = [];
currentPage: number = 1;
itemsPerPage: number = 6;

get totalPages(): number {
  return Math.ceil(this.items.length / this.itemsPerPage);
}

// Actualiza los ítems paginados cada vez que cambia la lista o la página
setPaginatedItems(): void {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.paginatedItems = this.items.slice(start, end);
}

// Ir a la página siguiente
nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.setPaginatedItems();
  }
}

// Ir a la página anterior
prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.setPaginatedItems();
  }
}

  async deleteItem(item: any) {
    // Si el item tiene id, intenta eliminarlo del backend
    if (item.id && navigator.onLine) {
      try {
        await this.http.delete(`http://localhost:8000/api/v1/items/${item.id}`).toPromise();
        this.loadItemsFromApi();
      } catch (error) {
        alert('Error al eliminar el item del backend.');
        console.error(error);
      }
    } else if (item.id) {
      // Si no hay internet, elimina solo de IndexedDB
      await this.indexedDBService.deleteData(item.id);
      this.loadItemsFromApi();
    }
  }


}