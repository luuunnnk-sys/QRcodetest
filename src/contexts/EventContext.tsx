import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { localDB, Event as DBEvent } from '../lib/local-storage';

interface Event {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  secret_key: string;
  created_at: string;
  updated_at: string;
}

interface EventContextType {
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  createEvent: (name: string, description?: string) => Promise<Event>;
  loading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

function generateId(): string {
  return crypto.randomUUID();
}

function generateSecretKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, []);

  async function loadEvent() {
    try {
      await localDB.init();
      const savedEventId = localStorage.getItem('currentEventId');
      if (savedEventId) {
        const event = await localDB.getEvent(savedEventId);
        if (event) {
          setCurrentEvent(event as Event);
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(
    name: string,
    description?: string
  ): Promise<Event> {
    const now = new Date().toISOString();
    const event: DBEvent = {
      id: generateId(),
      name,
      description: description || undefined,
      logo_url: undefined,
      secret_key: generateSecretKey(),
      created_at: now,
      updated_at: now,
    };

    await localDB.addEvent(event);
    setCurrentEvent(event as Event);
    localStorage.setItem('currentEventId', event.id);
    return event as Event;
  }

  const handleSetCurrentEvent = (event: Event | null) => {
    setCurrentEvent(event);
    if (event) {
      localStorage.setItem('currentEventId', event.id);
    } else {
      localStorage.removeItem('currentEventId');
    }
  };

  return (
    <EventContext.Provider
      value={{
        currentEvent,
        setCurrentEvent: handleSetCurrentEvent,
        createEvent,
        loading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
