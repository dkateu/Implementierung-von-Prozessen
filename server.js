let port = 8005;
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let uuidv4 = require('uuidv4');

//User initialisieren
function initUsers() {
  let users = [];
  users.push({
    user_nachname: "Kateu",
    user_vorname: "derrick",
    ausweisType: "reisepass",
    ID_Ausweis: "123456",
    bonitaet: "true",

  })

  users.push({
    user_nachname: "Mbigah",
    user_vorname: "Naura",
    ausweisType: "reisepass",
    ID_Ausweis: "123456",
    bonitaet: "false",
  })
  return users;
}


// Zimmer initialisieren
function initZimmer() {
  let zimmer = [];
  for (let i = 100; i < 120; ++i) {
    zimmer.push({
      id: i,
      roomtype: "einzel",
      price: 100,
      guest: "none",
      status: "free",
      bookings: [],
      city: i < 110 ? 'brandenburg' : i < 115 ? 'berlin' : 'hannover',
      hotel: i < 105 ? 'imbiss' : i < 110 ? 'intercity' : i < 115 ? 'berliner Hotel' : 'intercity'
    });
  }
  for (let i = 200; i < 210; ++i) {
    zimmer.push({
      id: i,
      roomtype: "doppel",
      price: 200,
      guest: "none",
      status: "free",
      bookings: [],
      city: i < 205 ? 'brandenburg' : i < 210 ? 'berlin' : 'hannover',
      hotel: i < 203 ? 'imbiss' : i < 206 ? 'intercity' : i < 210 ? 'berliner Hotel' : 'intercity'
    });
  }
  for (let i = 300; i < 305; ++i) {
    zimmer.push({
      id: i,
      roomtype: "suite",
      price: 300,
      guest: "none",
      status: "free",
      bookings: [],
      city: i < 301 ? 'brandenburg' : i < 305 ? 'berlin' : 'hannover',
      hotel: i < 301 ? 'imbiss' : i < 303 ? 'intercity' : i < 305 ? 'berliner Hotel' : 'intercity'
    });
  }
  return zimmer;
}

// Deutsche Bahnreise initialisieren
let bahnPreise = [];
bahnPreise.push({
  ziel: 'berlin',
  klasse1: {
    id: 'klasse1',
    preis: 90
  },
  klasse2: {
    id: 'klasse2',
    preis: 60
  }
});
bahnPreise.push({
  ziel: 'brandenburg',
  klasse1: {
    id: 'klasse1',
    preis: 70
  },
  klasse2: {
    id: 'klasse2',
    preis: 56
  }
});
bahnPreise.push({
  ziel: 'hannover',
  klasse1: {
    id: 'klasse1',
    preis: 80
  },
  klasse2: {
    id: 'klasse2',
    preis: 40
  }
});

// Fahrzeug initialisieren
function initFahrzeug() {
  let fahrzeug = [];
  for (let i = 0; i < 10; i++) {
    if (i < 5) {
      fahrzeug.push({
        id: i,
        price: 45, // Preis pro Tag
        type: 'kleinwagen',
        status: 'free'
      });
    } else if (i < 7) {
      fahrzeug.push({
        id: i,
        price: 80, // Preis pro Tag
        type: 'suv',
        status: 'free'
      });
    } else {
      fahrzeug.push({
        id: i,
        price: 80, // Preis pro Tag
        type: 'limozine',
        status: 'free'
      });
    }
  }
  return fahrzeug;
}

//Deklaration der globalenn Variablen

let fahrzeuge = initFahrzeug();
let users = initUsers();
let zimmern = initZimmer();

//

app.get('/hotels/berlin/zimmer', (req, res) => {
  res.send(Object.keys(zimmern));
});

app.get('/hotels/berlin/zimmer/:roomid', (req, res) => {
  res.send(zimmern[req.params.roomid]);
});

app.put('/hotels/berlin/zimmer/:roomid', (req, res) => {
  let change = req.body;
  if (change.status === "free") {
    zimmern[req.params.roomid].guest = "none";
    zimmern[req.params.roomid].status = "free";
  }
  else if (change.status === "occupied" && change.guest != undefined) {
    zimmern[req.params.roomid].guest = change.guest;
    zimmern[req.params.roomid].status = "occupied";
  }
  else {
    res.sendStatus(400);
    return;
  }
  res.sendStatus(200);
});



// Buchung starten
app.post('/booking/start', (req, res) => {
  let bookingRef = uuidv4.uuid()
  bookings.push(bookingRef)
  return res.json({ bookingRef: bookingRef })
})

// Buchungen speichern
let bookings = [];

// Zimmer buchen
app.post('/bookings/hotel', (req, res) => {
  const { stadt, hotel, zimmertype, dauer, price } = req.body;
  const bookingId = generateBookingId();
  var totalPrice;
  var room_id;

  // Zimmer buchen

  const zimmer = zimmern.find(zimmer => zimmer.city === stadt && zimmer.roomtype === zimmertype && zimmer.status === 'free');
  if (zimmer) {
    totalPrice = zimmer.price * dauer;
    room_id = zimmer.id;

    const booking = {
      id: bookingId,
      stadt: zimmer.city,
      hotel: zimmer.hotel,
      zimmertype: zimmer.roomtype,
      dauer: dauer,
      totalPrice: totalPrice,
      zimmerId: zimmer.id
    };

    bookings.push(booking);

  } else {
    return res.status(400).send({ error: 'Kein passendes Zimmer verfügbar.' });
  }

  res.status(200).send({ bookingId, totalPrice, room_id });
});

// Zimemrstatus ändern

app.put('/bookings/:bookingId/status', (req, res) => {
  const bookingId = req.params.bookingId;
  // Finde die Buchung anhand der Buchungs-ID
  const booking = bookings.find(booking => booking.id === bookingId);
  if (!booking) {
    return res.status(404).send({ error: 'Buchung nicht gefunden.' });
  }
  // Finde das zugehörige Zimmer anhand der Zimmer-ID in der Buchung
  const zimmer = zimmern.find(zimmer => zimmer.id === booking.zimmerId);

  if (!zimmer) {
    return res.status(404).send({ error: 'Zimmer nicht gefunden.' });
  }
  // Setze den Status des Zimmers auf "belegt"
  zimmer.status = 'belegt';
  res.status(200).send({ message: 'Zimmerstatus erfolgreich auf "belegt" gesetzt.' });
});


// Bahnreise buchen

app.post('/bookings/bahn', (req, res) => {
  const { ziel, reqklasse } = req.body;
  const bookingId = generateBookingId();
  var totalPrice;
  // Bahnreise buchen
  const bahnPreis = bahnPreise.find(bahnPreis => bahnPreis.ziel === ziel);
  if (bahnPreis) {
    const klasse = reqklasse === bahnPreis.klasse1.id ? bahnPreis.klasse1 : bahnPreis.klasse2;
    const price = klasse.preis;
    const booking = {
      id: bookingId,
      ziel: bahnPreis.ziel,
      klasse: klasse.id,
      totalPrice: price
    };

    bookings.push(booking);
    res.status(200).send({ bookingId, totalPrice: price });
  } else {
    res.status(404).send({ error: 'Keine passende Bahnreise verfügbar.' });
  }
});

// Fahrzeug mieten

app.post('/bookings/fahrzeug', (req, res) => {
  const { fahrzeugTyp, dauer } = req.body;
  const bookingId = generateBookingId();
  var totalPrice;
  var fahrzeugId;

  // Fahrzeug mieten

  const fahrzeug = fahrzeuge.find(fahrzeug => fahrzeug.type === fahrzeugTyp && fahrzeug.status === 'free');
  if (fahrzeug) {
    //     totalPrice: fahrzeug.price * dauer;
    fahrzeugId = fahrzeug.id;
    const booking = {
      id: bookingId,
      fahrzeugId: fahrzeug.id,
      fahrzeugTyp: fahrzeug.type,
      dauer: dauer,
      price: fahrzeug.price,
      totalPrice: fahrzeug.price * dauer
    };

    totalPrice = fahrzeug.price * dauer;
    bookings.push(booking);
  } else {
    return res.status(404).send({ error: 'Kein passendes Fahrzeug verfügbar.' });
  }

  res.status(200).send({ bookingId, totalPrice, fahrzeugId });
});

// Buchung stornieren

app.delete('/bookings/:bookingId', (req, res) => {
  const { bookingId } = req.params;

  const index = bookings.findIndex(booking => booking.id === bookingId);

  if (index !== -1) {
    const booking = bookings[index];

    if (booking.zimmertype) {
      const zimmer = zimmern.find(zimmer => zimmer.id === booking.zimmerId);
      if (zimmer) {
        zimmer.status = 'free';
        const bookingIndex = zimmer.bookings.indexOf(bookingId);
        if (bookingIndex !== -1) {
          zimmer.bookings.splice(bookingIndex, 1);
        }
      }
    }

    if (booking.fahrzeugTyp) {
      const fahrzeug = fahrzeuge.find(fahrzeug => fahrzeug.id === booking.fahrzeugId);
      if (fahrzeug) {
        fahrzeug.status = 'free';
      }
    }

    bookings.splice(index, 1);
    res.status(200).send({ message: 'Buchung erfolgreich storniert.' });
  } else {
    res.status(404).send({ error: 'Buchung nicht gefunden.' });
  }
});

//Bonitätprüfung

app.get('/bookings/checkbonitaet/:username', (req, res) => {
const user = users.find(user => user.user_nachname === req.params.username);

  if (user) {
    res.status(200).send({ bonitaet: user.bonitaet });

  } else {
    res.status(404).send({ message: 'User with Username ' + req.params.username + ' not found ' });
  }

});

// Gesamte Rechnung berechnen

app.get('/bookings/invoice', (req, res) => {
  let totalPrice = 0;

  bookings.forEach(booking => {
    totalPrice += booking.totalPrice;
  });

  res.status(200).send({ totalPrice });
});

// Hilfsfunktion zur Generierung einer Buchungs-ID
function generateBookingId() {
  return Math.random().toString(36).substring(2, 10);
}

// Buchung abbrechen

app.post('/booking/cancel', (req, res) => {
  let bookingRef = req.body.bookingRef
  bookings.delete(bookingRef)

  Object.values(zimmern).forEach(room => {
    let newRoomBookings = room.bookings.filter(item => item !== bookingRef)
  })
  res.json({})
})
// Server starten
let server = app.listen(port, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log("Webserver running at http://%s:%s", host, port);
})

