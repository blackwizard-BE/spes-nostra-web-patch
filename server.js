// server.js
const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const port = 3001;

// Connect to the SQLite database
const db = new sqlite3.Database('test.db', (err) => { //testdb = test.db||| prod db = ports.db
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the database.');
  }
});

// Middleware to parse JSON request body
app.use(express.json());

// Retrieve all data from the database
db.all('SELECT * FROM ports', (err, rows) => {
  if (err) {
    console.error('Error retrieving data from the database:', err.message);
  } else {
    //console.log('Data from the database:', rows);
  }
});

// Endpoint to fetch port data
app.get('/api/ports', (req, res) => {
  db.all('SELECT * FROM ports', (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      
      res.json(rows);
    }
  });
});
app.get('/api/request/ports/:id', (req, res) => {

  const portId = req.params.id;
  // Query the database to get port data and related information by ID
  db.get(`
    SELECT *
    FROM ports
    WHERE ports.id = ?
  `, [portId], (err, port) => {
    if (err) {
      console.error('Error fetching port data:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(port);
    }
  });
});



// Endpoint to update port data
app.put('/api/save/ports/:labelAndRoom', (req, res) => {
  const { labelAndRoom } = req.params;
  const { label: newLabel, status, room, type, length, info, connectedid } = req.body;

  // Split the labelAndRoom parameter to extract label and room
  if(labelAndRoom!="undefined"){
  const [label, roomName] = labelAndRoom.split(':');
  const formattedRoomName = roomName.replace(/_/g, ' ');


  // Update the port data in the database
  db.run('UPDATE ports SET label = ?, status = ?, room = ?, type = ?, length = ?, info = ?, connectedid = ? WHERE label = ? AND room = ?', 
         [newLabel, status, room, type, length, info, connectedid, label, formattedRoomName], 
         function(err) {
    if (err) {
      console.error('Error updating port:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      
      res.status(200).json({ message: `Port ${label} in room ${roomName} updated successfully.` });
    }
  });
}
});
app.put('/api/save/port/:id', (req, res) => {
  const { id } = req.params;
  const { status, type, length, connectedId} = req.body;


  // Update the port data in the database
  db.run('UPDATE ports SET status = ?, type = ?, length = ?, connectedid = ? WHERE id = ?', 
         [status, type, length, connectedId, id], 
         function(err) {
    if (err) {
      console.error('Error updating port:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
    
      res.status(200).json({ message: `Connected id: ${id} updated successfully.` });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

