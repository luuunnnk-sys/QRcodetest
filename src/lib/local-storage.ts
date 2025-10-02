const DB_NAME = 'CheckInManagerDB';
const DB_VERSION = 1;

export interface Event {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  secret_key: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  qr_code_data: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  participant_id: string;
  scanner_name: string;
  scanner_email?: string;
  checked_in_at: string;
  is_duplicate: boolean;
}

class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('participants')) {
          const participantStore = db.createObjectStore('participants', { keyPath: 'id' });
          participantStore.createIndex('event_id', 'event_id', { unique: false });
          participantStore.createIndex('qr_code_data', 'qr_code_data', { unique: true });
        }

        if (!db.objectStoreNames.contains('check_ins')) {
          const checkInStore = db.createObjectStore('check_ins', { keyPath: 'id' });
          checkInStore.createIndex('participant_id', 'participant_id', { unique: false });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async addEvent(event: Event): Promise<Event> {
    const store = this.getStore('events', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(event);
      request.onsuccess = () => resolve(event);
      request.onerror = () => reject(request.error);
    });
  }

  async getEvents(): Promise<Event[]> {
    const store = this.getStore('events');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const store = this.getStore('events');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateEvent(event: Event): Promise<Event> {
    const store = this.getStore('events', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(event);
      request.onsuccess = () => resolve(event);
      request.onerror = () => reject(request.error);
    });
  }

  async addParticipants(participants: Participant[]): Promise<void> {
    const store = this.getStore('participants', 'readwrite');
    return new Promise((resolve, reject) => {
      let completed = 0;
      participants.forEach(participant => {
        const request = store.add(participant);
        request.onsuccess = () => {
          completed++;
          if (completed === participants.length) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    const store = this.getStore('participants');
    const index = store.index('event_id');
    return new Promise((resolve, reject) => {
      const request = index.getAll(eventId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getParticipantByQRCode(qrCode: string): Promise<Participant | undefined> {
    const store = this.getStore('participants');
    const index = store.index('qr_code_data');
    return new Promise((resolve, reject) => {
      const request = index.get(qrCode);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteParticipantsByEvent(eventId: string): Promise<void> {
    const participants = await this.getParticipantsByEvent(eventId);
    const store = this.getStore('participants', 'readwrite');
    return new Promise((resolve, reject) => {
      let completed = 0;
      participants.forEach(participant => {
        const request = store.delete(participant.id);
        request.onsuccess = () => {
          completed++;
          if (completed === participants.length) resolve();
        };
        request.onerror = () => reject(request.error);
      });
      if (participants.length === 0) resolve();
    });
  }

  async addCheckIn(checkIn: CheckIn): Promise<CheckIn> {
    const store = this.getStore('check_ins', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(checkIn);
      request.onsuccess = () => resolve(checkIn);
      request.onerror = () => reject(request.error);
    });
  }

  async getCheckIns(): Promise<CheckIn[]> {
    const store = this.getStore('check_ins');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCheckInsByParticipant(participantId: string): Promise<CheckIn[]> {
    const store = this.getStore('check_ins');
    const index = store.index('participant_id');
    return new Promise((resolve, reject) => {
      const request = index.getAll(participantId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDB = new LocalDatabase();
