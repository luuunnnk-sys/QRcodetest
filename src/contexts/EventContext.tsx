import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Event as SupabaseEvent } from '../lib/supabase';

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
      const savedEventId = localStorage.getItem('currentEventId');
      if (savedEventId) {
        const savedEvent = localStorage.getItem(`event_${savedEventId}`);
        if (savedEvent) {
          setCurrentEvent(JSON.parse(savedEvent));
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
    const eventId = crypto.randomUUID();
    const event: Event = {
      id: eventId,
      name,
      description: description || null,
      logo_url: null,
      secret_key: generateSecretKey(),
      created_at: now,
      updated_at: now,
    };

    localStorage.setItem(`event_${eventId}`, JSON.stringify(event));
    setCurrentEvent(event);
    localStorage.setItem('currentEventId', event.id);
    return event;
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
