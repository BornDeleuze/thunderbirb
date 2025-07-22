import './style.css'
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  DocumentData
} from "firebase/firestore";
import { Calendar } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from "@fullcalendar/daygrid";

interface EventData {
  id?: string;
  title: string;
  start: string;
  end?: string;
}

interface CalendarEvent extends EventData {
  id: string;
}

// Validate environment variables
const requiredEnvVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)  // Use underscore for unused parameter
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\nPlease create a .env file with these variables.`);
}

const firebaseConfig = {
  apiKey: requiredEnvVars.VITE_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnvVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventsRef = collection(db, "events");

const calendarEl = document.getElementById('calendar') as HTMLElement;

if (!calendarEl) {
  throw new Error('Calendar element not found');
}

const calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, interactionPlugin], 
  initialView: 'dayGridMonth',
  editable: true,
  selectable: true,
  selectMirror: true,
  longPressDelay: 100,
  events: [],
  height: 'auto',
  
  // Create new event
  select: async (info) => {
    const title = prompt("Enter event title:");
    if (title) {
      try {
        await addDoc(eventsRef, {
          title,
          start: info.startStr,
          end: info.endStr || info.startStr
        });
        console.log('Event added successfully');
      } catch (error) {
        console.error('Error adding event:', error);
        alert('Failed to add event. Please try again.');
      }
    }
    calendar.unselect();
  },

  // Delete event on click
  eventClick: async (info) => {
    if (confirm(`Delete event "${info.event.title}"?`)) {
      const eventId = info.event.id;
      if (eventId) {
        try {
          await deleteDoc(doc(db, "events", eventId));
          console.log('Event deleted successfully');
        } catch (error) {
          console.error('Error deleting event:', error);
          alert('Failed to delete event. Please try again.');
        }
      }
    }
  }
});

calendar.render();

// Real-time sync of Firestore events to calendar
onSnapshot(eventsRef, (snapshot) => {
  const events: CalendarEvent[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as DocumentData;
    events.push({
      id: docSnap.id,
      title: data.title,
      start: data.start,
      end: data.end
    });
  });
  
  // Remove existing events and add new ones
  calendar.removeAllEvents();
  calendar.addEventSource(events);
  
  console.log(`Synced ${events.length} events from Firestore`);
}, (error) => {
  console.error('Error listening to Firestore changes:', error);
});