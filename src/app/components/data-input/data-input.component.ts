import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { IndexedDBService } from '../../services/indexeddb.service';
import { CommonModule } from '@angular/common'; 
import { LucideAngularModule } from 'lucide-angular';
import { icons } from 'lucide-angular';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-data-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataInputComponent implements OnInit, OnDestroy {
  nombre = '';
  email = '';
  mensaje = '';
  items = signal<any[]>([]);
  currentPage = signal(1);
  itemsPerPage = 6;
  showPopup = signal(false);
  popupMessage = signal('');

  get totalPages() {
    return Math.max(1, Math.ceil(this.items().length / this.itemsPerPage));
  }

  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.items().slice(start, start + this.itemsPerPage);
  });

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

  ngOnDestroy(): void {}

  async onSubmit() {
    if (!this.nombre.trim() || !this.mensaje.trim()) {
      this.popupMessage.set('Por favor completa todos los campos.');
      this.showPopup.set(true);
      setTimeout(() => this.showPopup.set(false), 2000);
      return;
    }
    const data = {
      title: this.nombre,
      description: this.mensaje,
      synced: false
    };
    try {
      await this.indexedDBService.addData(data);
      this.popupMessage.set('Datos guardados localmente en IndexedDB.');
      this.showPopup.set(true);
      setTimeout(() => this.showPopup.set(false), 2000);
      this.nombre = '';
      this.email = '';
      this.mensaje = '';
      if (navigator.onLine) {
        await this.syncOfflineData();
        this.loadItemsFromApi();
      }
    } catch (error) {
      this.popupMessage.set('Error al guardar datos offline.');
      this.showPopup.set(true);
      setTimeout(() => this.showPopup.set(false), 2000);
      console.error(error);
    }
  }

  async deleteItem(item: any) {
    if (item.id && navigator.onLine) {
      try {
        await this.http.delete(`http://localhost:8000/api/v1/items/${item.id}`).toPromise();
        this.loadItemsFromApi();
      } catch (error) {
        this.popupMessage.set('Error al eliminar el item del backend.');
        this.showPopup.set(true);
        setTimeout(() => this.showPopup.set(false), 2000);
        console.error(error);
      }
    } else if (item.id) {
      await this.indexedDBService.deleteData(item.id);
      this.loadItemsFromApi();
    }
  }

  async syncOfflineData() {
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
        this.popupMessage.set('Error al sincronizar datos offline.');
        this.showPopup.set(true);
        setTimeout(() => this.showPopup.set(false), 2000);
        console.error(error);
      }
    }
  }

  loadItemsFromApi() {
    if (!navigator.onLine) {
      this.items.set([]);
      return;
    }
    this.http.get<any[]>('http://localhost:8000/api/v1/items/').subscribe({
      next: (data) => this.items.set(data),
      error: (err) => {
        this.items.set([]);
        if (navigator.onLine) {
          console.error('Error al cargar items desde la API', err);
        }
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }
}