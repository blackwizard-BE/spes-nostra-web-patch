import React, { useState, useEffect } from 'react';
import './PatchPanel.css'; // Import CSS for styling

// Function to fetch port data by ID
const fetchPortById = (portId) => {
  return fetch(`/api/ports/${portId}`)
    .then(response => response.json())
    .catch(error => console.error('Error fetching port data:', error));
};



// PatchPanelItem component for individual port
const PatchPanelItem = ({ port, onClick, onEdit }) => {
  const { label, status } = port; // Destructure label and status from port object

  let statusClassName = '';
  let labelAddon = '';

  // Determine the status class and label addon based on the status
  switch (status) {
    case 'tmib':
      statusClassName = 'tmib';
      labelAddon = '10Mbit';
      break;
    case 'hmib':
      statusClassName = 'hmib';
      labelAddon = '100Mbit';
      break;
    case 'gib':
      statusClassName = 'gib';
      labelAddon = '1Gbit';
      break;
    case 'tgib':
      statusClassName = 'tgib';
      labelAddon = '10Gbit';
      break;
    case 'inactive':
      statusClassName = 'inactive';
      labelAddon = 'Inactief';
      break;
    case false:
      statusClassName = 'inactive';
      labelAddon = 'Inactief';
      break;
    case 'unknown':
      statusClassName = 'unknown';
      labelAddon = 'unknown';
      break;
    default:
      statusClassName = '';
  }

  return (
    <div className={`patch-panel-item ${statusClassName}`} onClick={() => onClick(port)}>
      <div className="item-content">
        <div className="port-text">
          {label} {labelAddon}
        </div>
        <div className="edit-button">
          <button onClick={() => onEdit(port)}>Edit</button>
        </div>
      </div>
    </div>
  );
};

const EditMenu = ({ portInfo, onSave }) => {
  const [portName, setPortName] = useState(portInfo.label);
  const [roomName, setRoomName] = useState(portInfo.room);
  const [type, setTypeName] = useState(portInfo.type);
  const [length, setLength] = useState(portInfo.length);
  const [info, setinfo] = useState(portInfo.info);
  const [connectedId, setConnectedId] = useState(portInfo.connectedid);
  const [speed, setSpeed] = useState(portInfo.status); // Default speed

  const handleNameChange = (event) => {
    setPortName(event.target.value);
  };
  const handleTypeChange = (event) => {
    setTypeName(event.target.value);
  };
  const handleLengthChange = (event) => {
    setLength(event.target.value);
  };
  const handleInfoChange = (event) => {
    setinfo(event.target.value);
  };
  const handleRoomChange = (event) => {
    setRoomName(event.target.value);
  };
  const handleConnectedIdChange = (event) => {
    setConnectedId(event.target.value);
  };

  const handleSpeedChange = (event) => {
    setSpeed(event.target.value);
  };

  const handleSave = () => {
    // Replace spaces in roomName with underscores
    const formattedRoomName = roomName.replace(/\s/g, '_');

    // Send the updated port information to the backend API
    fetch(`/api/ports/${portInfo.label}:${formattedRoomName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: portName, status: speed, room: roomName, type: type, length: length, info: info, connectedid: connectedId }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save changes');
        }
        // Handle success, maybe show a success message
        onSave(); // Call the onSave callback after successful save
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        // Handle error, maybe show an error message
      });
  };

  return (
    <div className="edit-menu">
      <h2>Edit Port {portInfo.label}</h2>
      <label>
        Port Name: &nbsp;
        <input type="text" value={portName} onChange={handleNameChange} />
      </label>
      <label><br></br>
        Room Name: &nbsp;
        <input type="text" value={roomName} onChange={handleRoomChange} />
      </label>
      <label><br></br>
        Type: &nbsp;
        <input type="text" value={type} onChange={handleTypeChange} />
      </label>
      <label><br></br>
        Length: &nbsp;
        <input type="text" value={length} onChange={handleLengthChange} />
      </label>
      <label><br></br>
        Info: &nbsp;
        <input type="text" value={info} onChange={handleInfoChange} />
      </label>
      <label><br></br>
        ConnectedId: &nbsp;
        <input type="text" value={connectedId} onChange={handleConnectedIdChange} />
      </label>
      <div>
        Speed:
        <label>
          <input type="radio" value="tmib" checked={speed === 'tmib'} onChange={handleSpeedChange} />
          10Mbit
        </label>
        <label>
          <input type="radio" value="hmib" checked={speed === 'hmib'} onChange={handleSpeedChange} />
          100Mbit
        </label>
        <label>
          <input type="radio" value="gib" checked={speed === 'gib'} onChange={handleSpeedChange} />
          1Gbit
        </label>
        <label>
          <input type="radio" value="tgib" checked={speed === 'tgib'} onChange={handleSpeedChange} />
          10Gbit
        </label>
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

// PortInfo component for displaying port information
const PortInfo = ({ portInfo }) => {
  const [connectedPortInfo, setConnectedPortInfo] = useState(null);

  useEffect(() => {
    if (portInfo.connectedid) {
      fetchPortById(portInfo.connectedid)
        .then(connectedPortData => {
          setConnectedPortInfo(connectedPortData);
        })
        .catch(error => {
          // Handle error (e.g., display error message)
        });
    }
    else {
      setConnectedPortInfo(null);
    }
  }, [portInfo.connectedid]); // Fetch connected port info when portInfo.connectedid changes



  return (
    <div className="port-info">
      <h2>Port Information</h2>
      <p><strong>Label:</strong> {portInfo.label}</p>
      <p><strong>Status:</strong> {portInfo.status}</p>
      <p><strong>Room:</strong> {portInfo.room}</p>
      <p><strong>Type:</strong> {portInfo.type}</p>
      <p><strong>Length:</strong> {portInfo.length}</p>
      <p><strong>Info:</strong> {portInfo.info}</p>
      {connectedPortInfo && (
        <p><strong>Connected to:</strong> {connectedPortInfo.room + ': ' + connectedPortInfo.label}</p>
      )}
      {/* Add more information as needed */}
    </div>
  );
};

// Main App component
export default function App() {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [editMode, setEditMode] = useState(false); // State variable for edit mode

  // Function to fetch ports data from the backend API
  const fetchPorts = () => {
    fetch('/api/ports')
      .then(response => response.json())
      .then(data => {
        setPorts(data);
      })
      .catch(error => console.error('Error fetching ports:', error));
  };

  // Fetch ports data from the backend API on component mount
  useEffect(() => {
    fetchPorts();
  }, []);

  // Handle port click event
  const handlePortClick = (port) => {
    setSelectedPort(port);
  };

  // Handle edit click event
  const handleEditClick = (port) => {
    setSelectedPort(port);
    setEditMode(true); // Set edit mode to true
  };

  // Function to handle save callback
  const handleSave = () => {
    fetchPorts(); // Refetch ports data after saving changes
    setEditMode(false); // Exit edit mode
  };

  // Group ports by room
  const groupedPorts = ports.reduce((groups, port) => {
    const room = port.room;
    if (!groups[room]) {
      groups[room] = [];
    }
    groups[room].push(port);
    return groups;
  }, {});

  return (
    <div className="app">
      <h1>Patch Panel Lijst</h1>
      <div className="patch-panel-container">
        {Object.entries(groupedPorts).map(([room, roomPorts], index) => (
          <div key={index} className="room-container">
            <h2>{room}</h2>
            <div className="patch-panel">
              {roomPorts.map((port, index) => (
                <PatchPanelItem
                  key={index}
                  port={port} // Pass the entire port object as prop
                  onClick={handlePortClick}
                  onEdit={handleEditClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedPort && !editMode && <PortInfo portInfo={selectedPort} />}
      {selectedPort && editMode && (
        <EditMenu portInfo={selectedPort} onSave={handleSave} />
      )}
    </div>
  );
}
