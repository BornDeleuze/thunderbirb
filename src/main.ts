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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBmjIMdlyDgqp2_NXMgeqMzyV-G7js_JQo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thunderbirb-8f840.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thunderbirb-8f840",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thunderbirb-8f840.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "621611243040",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:621611243040:web:a3cd68b5ae89359816ce45"
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