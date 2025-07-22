<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sailboat Shared Calendar</title>
  <link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css' rel='stylesheet' />
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
    }
    #calendar {
      max-width: 900px;
      margin: 40px auto;
    }
  </style>
</head>
<body>
  <h2 style="text-align: center;">Sailboat Shared Calendar</h2>
  <div id='calendar'></div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
    import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

    interface EventData {
      title: string;
      start: string;
      end: string;
    }

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const eventsRef = collection(db, "events");

    const calendarEl = document.getElementById('calendar') as HTMLElement;
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      editable: true,
      selectable: true,
      events: [],
      select: async (info: any) => {
        const title = prompt("Enter event title:");
        if (title) {
          const newEvent: EventData = {
            title,
            start: info.startStr,
            end: info.endStr
          };
          await addDoc(eventsRef, newEvent);
        }
      },
      eventClick: async (info: any) => {
        if (confirm("Delete this event?")) {
          const snap = await getDocs(eventsRef);
          snap.forEach(docSnap => {
            const data = docSnap.data() as EventData;
            if (data.title === info.event.title && data.start === info.event.startStr) {
              deleteDoc(doc(eventsRef, docSnap.id));
            }
          });
        }
      }
    });

    calendar.render();

    onSnapshot(eventsRef, (snapshot) => {
      const events: EventData[] = [];
      snapshot.forEach(doc => {
        events.push(doc.data() as EventData);
      });
      calendar.removeAllEvents();
      calendar.addEventSource(events);
    });
  </script>
</body>
</html>
