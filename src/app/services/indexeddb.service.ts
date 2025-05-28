// src/app/services/indexeddb.service.ts
import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

interface OfflineData {
  id?: number;
  title: string;
  description: string;
  synced?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbPromise?: Promise<IDBPDatabase>;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB();
    }
  }

  private async initDB() {
    return await openDB('offlineDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('datos')) {
          db.createObjectStore('datos', {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      }
    });
  }

  async addData(data: OfflineData) {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.add('datos', data);
  }

  async getAllData(): Promise<OfflineData[]> {
    if (!this.dbPromise) return [];
    const db = await this.dbPromise;
    return await db.getAll('datos');
  }

  async deleteData(id: number) {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.delete('datos', id);
  }
}
