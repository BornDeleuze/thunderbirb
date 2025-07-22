import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Calendar } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from "@fullcalendar/daygrid";
const firebaseConfig = {
    apiKey: "AIzaSyBmjIMdlyDgqp2_NXMgeqMzyV-G7js_JQo",
    authDomain: "thunderbirb-8f840.firebaseapp.com",
    projectId: "thunderbirb-8f840",
    storageBucket: "thunderbirb-8f840.firebasestorage.app",
    messagingSenderId: "621611243040",
    appId: "1:621611243040:web:a3cd68b5ae89359816ce45"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventsRef = collection(db, "events");
const calendarEl = document.getElementById('calendar');
const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: [],
    // Create new event
    select: async (info) => {
        console.log("woops");
        const title = prompt("Enter event title:");
        if (title) {
            await addDoc(eventsRef, {
                title,
                start: info.startStr,
                end: info.endStr
            });
        }
    },
    // Delete event on click
    eventClick: async (info) => {
        if (confirm(`Delete event "${info.event.title}"?`)) {
            const snapshot = await getDocs(eventsRef);
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.title === info.event.title && data.start === info.event.startStr) {
                    deleteDoc(doc(eventsRef, docSnap.id));
                }
            });
        }
    }
});
calendar.render();
// Real-time sync of Firestore events to calendar
onSnapshot(eventsRef, (snapshot) => {
    const events = [];
    snapshot.forEach(docSnap => {
        events.push(docSnap.data());
    });
    calendar.removeAllEvents();
    calendar.addEventSource(events);
});
