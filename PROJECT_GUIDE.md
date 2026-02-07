# Airport Tracking and Analytics System - Student Project Guide

## 📋 Project Overview

This project demonstrates how **live air traffic data** can make airports safer and more efficient. We combine real-time aircraft data from **OpenSky Network** and **AviationStack APIs** with three databases (**MongoDB**, **Redis**, and **Neo4j**) to build a comprehensive airport monitoring dashboard.

---

## 🎯 Project Goals

1. **Monitor live flights and gate status** in real-time
2. **Detect potential mid-air collisions** between aircraft
3. **Identify low-altitude risks** outside airport zones
4. **Track turnaround operations** (fueling, cleaning, boarding)
5. **Provide passenger flight information**
6. **Analyze historical flight data**
7. **Replay flight routes** for incident investigation

---

## 👥 Team Structure (7 Members)

| Team Member | Use Case | Responsibility |
|------------|----------|----------------|
| **Sameer Kulkarni** | Monitor Live Flight & Gate Status | Real-time dashboard, flight-gate relations |
| **Harjot Singh** | Monitor Airport KPIs | Performance metrics, delay statistics |
| **Shambhavi Pillai** | Mid-Air Collision Detection | Safety alerts, distance calculations |
| **Prajwal Vijaykumar** | Detect Low-Altitude Aircraft | Altitude monitoring, zone verification |
| **Kartheek Tatagari** | Passenger Flight Information | Flight search, status display |
| **Smitha Anoop** | View Flight History | Historical data analysis, reporting |
| **Shahid Sherwani** | Replay Flight Route | Route visualization, incident analysis |

---

## 🗄️ Database Architecture

### Why Three Databases?

Each database serves a specific purpose based on data characteristics:

### 1. **Redis** - Real-Time Data Store
- **Purpose**: Fast, in-memory storage for frequently changing data
- **Stores**:
  - Live flight status (on-time, delayed, landed)
  - Current aircraft positions and altitude
  - Gate occupancy status
  - Safety alerts and warnings
  - KPI counters (delays, flight activity)
- **Why**: Extremely fast read/write operations for real-time updates

### 2. **Neo4j** - Graph Database
- **Purpose**: Manage relationships between airport entities
- **Stores**:
  - Flight ↔ Gate assignments
  - Gate ↔ Terminal relationships
  - Aircraft ↔ Airport zone proximity
  - Airport layout connections
- **Why**: Excellent for querying connected data and relationships

### 3. **MongoDB** - Document Database
- **Purpose**: Store structured and historical data
- **Stores**:
  - Flight schedules and metadata
  - Passenger information
  - Flight event history
  - Aircraft telemetry records
  - Historical data for analysis
- **Why**: Flexible schema, great for large datasets and complex queries

---

## 🔄 System Data Flow

```
External APIs (OpenSky/AviationStack)
           ↓
    Backend Services
           ↓
    ┌──────┴──────┐
    ↓      ↓      ↓
  Redis  Neo4j  MongoDB
    ↓      ↓      ↓
    └──────┬──────┘
           ↓
   Frontend Dashboard
```

---

## 📖 Step-by-Step Implementation Guide

### **STEP 1: Environment Setup** (All Team Members)

#### 1.1 Install Required Software
```bash
# Install Node.js (v16 or higher)
# Download from: https://nodejs.org/

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Install Visual Studio Code
# Download from: https://code.visualstudio.com/
```

#### 1.2 Clone the Repository
```bash
git clone https://github.com/Sameer-kulkarni-sk/AIRPORT-TRACKING-AND-ANALYTICS-SYSTEM-SRH-UNI-KP4SH-
cd AIRPORT-TRACKING-AND-ANALYTICS-SYSTEM-SRH-UNI-KP4SH-
```

#### 1.3 Install Dependencies
```bash
npm install
```

#### 1.4 Start Databases with Docker
```bash
docker-compose up -d
```

This starts:
- Redis on port 6379
- MongoDB on port 27017
- Neo4j on port 7687 (web interface: 7474)

---

### **STEP 2: API Integration** (All Team Members)

#### 2.1 Get API Keys

**OpenSky Network API**
- Free, no API key required
- Documentation: https://openskynetwork.github.io/opensky-api/
- Provides real-time aircraft positions

**AviationStack API**
- Sign up at: https://aviationstack.com/
- Free tier: 500 requests/month
- Get your API key from dashboard

#### 2.2 Configure Environment Variables
Create `.env` file:
```env
# API Keys
AVIATIONSTACK_API_KEY=your_api_key_here

# Database Connections
REDIS_HOST=localhost
REDIS_PORT=6379

MONGODB_URI=mongodb://localhost:27017/airport_system

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Server Configuration
PORT=8080
```

---

### **STEP 3: Individual Use Case Implementation**

---

## 🔵 **USE CASE 1: Monitor Live Flight & Gate Status**
**Team Member: Sameer Kulkarni**

### Objective
Create a real-time dashboard showing all active flights and gate assignments.

### Implementation Steps

#### 3.1.1 Create Backend Service
```javascript
// services/flightMonitorService.js

const redis = require('redis');
const neo4j = require('neo4j-driver');
const { MongoClient } = require('mongodb');

class FlightMonitorService {
  constructor() {
    this.redisClient = redis.createClient();
    this.neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    this.mongoClient = new MongoClient(process.env.MONGODB_URI);
  }

  async getLiveFlights() {
    // 1. Get live status from Redis
    const liveStatus = await this.redisClient.hGetAll('live:flights');
    
    // 2. Get flight-gate relations from Neo4j
    const session = this.neo4jDriver.session();
    const gateAssignments = await session.run(`
      MATCH (f:Flight)-[:ASSIGNED_TO]->(g:Gate)-[:BELONGS_TO]->(t:Terminal)
      RETURN f.flightNumber, g.gateNumber, t.terminalName
    `);
    
    // 3. Get schedule from MongoDB
    const db = this.mongoClient.db('airport_system');
    const schedules = await db.collection('flight_schedules').find({}).toArray();
    
    // 4. Combine data
    return this.combineFlightData(liveStatus, gateAssignments, schedules);
  }
}
```

#### 3.1.2 Create API Endpoint
```javascript
// routes/flightMonitor.js

const express = require('express');
const router = express.Router();
const FlightMonitorService = require('../services/flightMonitorService');

const service = new FlightMonitorService();

router.get('/api/flights/live', async (req, res) => {
  try {
    const flights = await service.getLiveFlights();
    res.json({ success: true, data: flights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### 3.1.3 Create Frontend Dashboard
```html
<!-- public/dashboard.html -->

<!DOCTYPE html>
<html>
<head>
  <title>Flight Monitor Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="dashboard">
    <h1>Live Flight Monitor</h1>
    <div id="flight-map"></div>
    <table id="flight-table">
      <thead>
        <tr>
          <th>Flight Number</th>
          <th>Status</th>
          <th>Gate</th>
          <th>Terminal</th>
          <th>Delay</th>
        </tr>
      </thead>
      <tbody id="flight-data"></tbody>
    </table>
  </div>
  <script src="dashboard.js"></script>
</body>
</html>
```

```javascript
// public/dashboard.js

async function updateDashboard() {
  const response = await fetch('/api/flights/live');
  const { data } = await response.json();
  
  const tbody = document.getElementById('flight-data');
  tbody.innerHTML = data.map(flight => `
    <tr class="${flight.status === 'delayed' ? 'delayed' : ''}">
      <td>${flight.flightNumber}</td>
      <td>${flight.status}</td>
      <td>${flight.gate}</td>
      <td>${flight.terminal}</td>
      <td>${flight.delay || '-'}</td>
    </tr>
  `).join('');
}

// Update every 10 seconds
setInterval(updateDashboard, 10000);
updateDashboard();
```

#### 3.1.4 Test Your Implementation
```bash
# Start the backend
node server.js

# Open browser
# Navigate to: http://localhost:8080/dashboard
```

---

## 🟢 **USE CASE 2: Monitor Airport KPIs**
**Team Member: Harjot Singh**

### Objective
Display key performance indicators like delays, on-time percentage, and flight activity.

### Implementation Steps

#### 3.2.1 Create KPI Service
```javascript
// services/kpiService.js

class KPIService {
  async getAirportKPIs() {
    // 1. Get real-time counters from Redis
    const delayCount = await this.redisClient.get('kpi:delays:count');
    const totalFlights = await this.redisClient.get('kpi:flights:total');
    
    // 2. Calculate from MongoDB historical data
    const db = this.mongoClient.db('airport_system');
    const avgDelay = await db.collection('flights').aggregate([
      { $match: { status: 'delayed' } },
      { $group: { _id: null, avgDelay: { $avg: '$delayMinutes' } } }
    ]).toArray();
    
    return {
      totalFlights: parseInt(totalFlights),
      delayedFlights: parseInt(delayCount),
      onTimePercentage: ((totalFlights - delayCount) / totalFlights * 100).toFixed(2),
      averageDelay: avgDelay[0]?.avgDelay || 0
    };
  }
}
```

#### 3.2.2 Create KPI Dashboard
```html
<!-- public/kpi-dashboard.html -->

<div class="kpi-container">
  <div class="kpi-card">
    <h3>Total Flights Today</h3>
    <p id="total-flights" class="kpi-value">0</p>
  </div>
  <div class="kpi-card">
    <h3>On-Time Performance</h3>
    <p id="on-time-pct" class="kpi-value">0%</p>
  </div>
  <div class="kpi-card">
    <h3>Delayed Flights</h3>
    <p id="delayed-flights" class="kpi-value">0</p>
  </div>
  <div class="kpi-card">
    <h3>Average Delay</h3>
    <p id="avg-delay" class="kpi-value">0 min</p>
  </div>
</div>
```

---

## 🔴 **USE CASE 3: Mid-Air Collision Detection**
**Team Member: Shambhavi Pillai**

### Objective
Detect when two aircraft come dangerously close to each other.

### Implementation Steps

#### 3.3.1 Create Collision Detection Service
```javascript
// services/collisionService.js

class CollisionDetectionService {
  constructor() {
    this.SAFE_DISTANCE_KM = 5; // 5 km minimum separation
    this.SAFE_ALTITUDE_DIFF_FT = 1000; // 1000 ft vertical separation
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async checkCollisionRisks() {
    // Get all active aircraft positions from Redis
    const aircraftKeys = await this.redisClient.keys('aircraft:*:position');
    const positions = [];
    
    for (const key of aircraftKeys) {
      const data = await this.redisClient.hGetAll(key);
      positions.push({
        callsign: key.split(':')[1],
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        altitude: parseFloat(data.altitude)
      });
    }
    
    // Check all pairs
    const alerts = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = this.calculateDistance(
          positions[i].latitude, positions[i].longitude,
          positions[j].latitude, positions[j].longitude
        );
        
        const altitudeDiff = Math.abs(positions[i].altitude - positions[j].altitude);
        
        if (distance < this.SAFE_DISTANCE_KM && altitudeDiff < this.SAFE_ALTITUDE_DIFF_FT) {
          alerts.push({
            aircraft1: positions[i].callsign,
            aircraft2: positions[j].callsign,
            distance: distance.toFixed(2),
            altitudeDiff: altitudeDiff.toFixed(0),
            severity: 'HIGH',
            timestamp: new Date()
          });
          
          // Store alert in Redis
          await this.redisClient.set(
            `alert:collision:${Date.now()}`,
            JSON.stringify(alerts[alerts.length - 1]),
            { EX: 300 } // Expire after 5 minutes
          );
        }
      }
    }
    
    return alerts;
  }
}
```

#### 3.3.2 Run Collision Detection
```bash
# Start the collision detection service
node services/collisionService.js
```

---

## 🟡 **USE CASE 4: Detect Low-Altitude Aircraft**
**Team Member: Prajwal Vijaykumar**

### Objective
Identify aircraft flying below safe altitude outside airport zones.

### Implementation Steps

#### 3.4.1 Create Altitude Monitoring Service
```javascript
// services/altitudeCheckService.js

class AltitudeCheckService {
  constructor() {
    this.MIN_SAFE_ALTITUDE_FT = 1000;
  }

  async checkLowAltitudeAircraft() {
    // Get aircraft positions from Redis
    const aircraftKeys = await this.redisClient.keys('aircraft:*:position');
    const lowAltitudeAlerts = [];
    
    for (const key of aircraftKeys) {
      const data = await this.redisClient.hGetAll(key);
      const callsign = key.split(':')[1];
      const altitude = parseFloat(data.altitude);
      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);
      
      // Check if altitude is below threshold
      if (altitude < this.MIN_SAFE_ALTITUDE_FT) {
        // Verify with Neo4j if aircraft is near airport zone
        const session = this.neo4jDriver.session();
        const result = await session.run(`
          MATCH (a:Airport)-[:HAS_ZONE]->(z:Zone)
          WHERE point.distance(
            point({latitude: $lat, longitude: $lon}),
            point({latitude: z.latitude, longitude: z.longitude})
          ) < z.radius
          RETURN a.name, z.name
        `, { lat: latitude, lon: longitude });
        
        // If NOT in airport zone, create alert
        if (result.records.length === 0) {
          lowAltitudeAlerts.push({
            callsign,
            altitude,
            latitude,
            longitude,
            severity: 'MEDIUM',
            message: 'Aircraft flying below safe altitude outside airport zone'
          });
          
          // Store in Redis
          await this.redisClient.set(
            `alert:low-altitude:${callsign}`,
            JSON.stringify(lowAltitudeAlerts[lowAltitudeAlerts.length - 1]),
            { EX: 300 }
          );
        }
      }
    }
    
    return lowAltitudeAlerts;
  }
}
```

---

## 🟣 **USE CASE 5: Passenger Flight Information**
**Team Member: Kartheek Tatagari**

### Objective
Allow passengers to search for their flight and view status.

### Implementation Steps

#### 3.5.1 Create Passenger Service
```javascript
// services/passengerService.js

class PassengerService {
  async getFlightInfo(flightNumber) {
    // 1. Get schedule from MongoDB
    const db = this.mongoClient.db('airport_system');
    const schedule = await db.collection('flight_schedules').findOne({
      flightNumber: flightNumber
    });
    
    if (!schedule) {
      throw new Error('Flight not found');
    }
    
    // 2. Get live status from Redis
    const liveStatus = await this.redisClient.hGetAll(`flight:${flightNumber}:status`);
    
    // 3. Get gate assignment from Neo4j
    const session = this.neo4jDriver.session();
    const gateInfo = await session.run(`
      MATCH (f:Flight {flightNumber: $flightNumber})-[:ASSIGNED_TO]->(g:Gate)-[:BELONGS_TO]->(t:Terminal)
      RETURN g.gateNumber, t.terminalName
    `, { flightNumber });
    
    return {
      flightNumber: schedule.flightNumber,
      airline: schedule.airline,
      origin: schedule.origin,
      destination: schedule.destination,
      scheduledDeparture: schedule.scheduledDeparture,
      scheduledArrival: schedule.scheduledArrival,
      status: liveStatus.status || 'Scheduled',
      gate: gateInfo.records[0]?.get('g.gateNumber') || 'TBA',
      terminal: gateInfo.records[0]?.get('t.terminalName') || 'TBA',
      delay: liveStatus.delayMinutes || 0
    };
  }
}
```

#### 3.5.2 Create Passenger Search Page
```html
<!-- public/passenger-search.html -->

<div class="search-container">
  <h1>Flight Information</h1>
  <input type="text" id="flight-search" placeholder="Enter flight number (e.g., AA123)">
  <button onclick="searchFlight()">Search</button>
  
  <div id="flight-info" style="display: none;">
    <h2>Flight Details</h2>
    <div class="info-grid">
      <div><strong>Flight:</strong> <span id="flight-number"></span></div>
      <div><strong>Airline:</strong> <span id="airline"></span></div>
      <div><strong>Status:</strong> <span id="status"></span></div>
      <div><strong>Gate:</strong> <span id="gate"></span></div>
      <div><strong>Terminal:</strong> <span id="terminal"></span></div>
      <div><strong>Departure:</strong> <span id="departure"></span></div>
    </div>
  </div>
</div>

<script>
async function searchFlight() {
  const flightNumber = document.getElementById('flight-search').value;
  const response = await fetch(`/api/passenger/flight/${flightNumber}`);
  const { data } = await response.json();
  
  // Display flight info
  document.getElementById('flight-info').style.display = 'block';
  document.getElementById('flight-number').textContent = data.flightNumber;
  document.getElementById('airline').textContent = data.airline;
  document.getElementById('status').textContent = data.status;
  document.getElementById('gate').textContent = data.gate;
  document.getElementById('terminal').textContent = data.terminal;
  document.getElementById('departure').textContent = data.scheduledDeparture;
}
</script>
```

---

## 🟠 **USE CASE 6: View Flight History**
**Team Member: Smitha Anoop**

### Objective
Provide historical flight data for analysis and reporting.

### Implementation Steps

#### 3.6.1 Create History Service
```javascript
// services/historyService.js

class HistoryService {
  async getFlightHistory(filters = {}) {
    const db = this.mongoClient.db('airport_system');
    
    // Build query
    const query = {};
    if (filters.startDate) {
      query.date = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.date = { ...query.date, $lte: new Date(filters.endDate) };
    }
    if (filters.airline) {
      query.airline = filters.airline;
    }
    
    // Get historical flights
    const flights = await db.collection('flight_history')
      .find(query)
      .sort({ date: -1 })
      .limit(100)
      .toArray();
    
    // Calculate statistics
    const stats = await db.collection('flight_history').aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalFlights: { $sum: 1 },
          avgDelay: { $avg: '$delayMinutes' },
          onTimeCount: {
            $sum: { $cond: [{ $lte: ['$delayMinutes', 15] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    return {
      flights,
      statistics: stats[0] || {}
    };
  }
}
```

---

## 🔵 **USE CASE 7: Replay Flight Route**
**Team Member: Shahid Sherwani**

### Objective
Visualize historical flight paths for incident investigation.

### Implementation Steps

#### 3.7.1 Create Replay Service
```javascript
// services/replayService.js

class ReplayService {
  async getFlightTelemetry(flightNumber, date) {
    const db = this.mongoClient.db('airport_system');
    
    // Get telemetry data (position updates over time)
    const telemetry = await db.collection('flight_telemetry')
      .find({
        flightNumber: flightNumber,
        date: new Date(date)
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    return telemetry.map(point => ({
      timestamp: point.timestamp,
      latitude: point.latitude,
      longitude: point.longitude,
      altitude: point.altitude,
      speed: point.speed,
      heading: point.heading
    }));
  }
}
```

#### 3.7.2 Create Replay Visualization
```javascript
// public/replay.js

class FlightReplay {
  constructor(telemetryData) {
    this.data = telemetryData;
    this.currentIndex = 0;
    this.map = this.initMap();
    this.marker = null;
    this.path = [];
  }

  initMap() {
    // Initialize map (using Leaflet or similar)
    const map = L.map('replay-map').setView([0, 0], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    return map;
  }

  play() {
    this.interval = setInterval(() => {
      if (this.currentIndex >= this.data.length) {
        this.stop();
        return;
      }
      
      const point = this.data[this.currentIndex];
      
      // Update marker position
      if (this.marker) {
        this.marker.setLatLng([point.latitude, point.longitude]);
      } else {
        this.marker = L.marker([point.latitude, point.longitude]).addTo(this.map);
      }
      
      // Draw path
      this.path.push([point.latitude, point.longitude]);
      L.polyline(this.path, { color: 'blue' }).addTo(this.map);
      
      // Update info panel
      document.getElementById('replay-time').textContent = point.timestamp;
      document.getElementById('replay-altitude').textContent = point.altitude;
      document.getElementById('replay-speed').textContent = point.speed;
      
      this.currentIndex++;
    }, 1000); // Update every second
  }

  stop() {
    clearInterval(this.interval);
  }
}
```

---

## 🚀 Running the Complete System

### Start All Services

```bash
# 1. Start databases
docker-compose up -d

# 2. Start backend server
npm start

# 3. Start individual services (in separate terminals)
node services/collisionService.js
node services/altitudeCheckService.js
node services/dataIngestionService.js
```

### Access the Application

- **Main Dashboard**: http://localhost:8080/dashboard
- **KPI Dashboard**: http://localhost:8080/kpi
- **Passenger Search**: http://localhost:8080/passenger
- **Flight History**: http://localhost:8080/history
- **Flight Replay**: http://localhost:8080/replay

---

## 🧪 Testing Your Implementation

### Test Checklist for Each Team Member

#### ✅ Sameer (Flight Monitor)
- [ ] Dashboard loads without errors
- [ ] Live flights are displayed
- [ ] Gate assignments are shown
- [ ] Data updates every 10 seconds

#### ✅ Harjot (KPIs)
- [ ] KPI cards display correct numbers
- [ ] On-time percentage calculates correctly
- [ ] Charts render properly

#### ✅ Shambhavi (Collision Detection)
- [ ] Service detects close aircraft
- [ ] Alerts are stored in Redis
- [ ] Dashboard shows collision warnings

#### ✅ Prajwal (Low Altitude)
- [ ] Low-altitude aircraft are detected
- [ ] Airport zones are checked correctly
- [ ] Alerts appear on map

#### ✅ Kartheek (Passenger Info)
- [ ] Flight search works
- [ ] Correct flight details are displayed
- [ ] Gate and terminal info is accurate

#### ✅ Smitha (History)
- [ ] Historical data loads
- [ ] Filters work correctly
- [ ] Statistics are calculated

#### ✅ Shahid (Replay)
- [ ] Flight path is visualized
- [ ] Animation plays smoothly
- [ ] Telemetry data is accurate

---

## 📊 Database Queries Reference

### Redis Commands
```bash
# Get live flight status
GET flight:AA123:status

# Get all aircraft positions
KEYS aircraft:*:position

# Get collision alerts
KEYS alert:collision:*
```

### Neo4j Queries
```cypher
// Get all gate assignments
MATCH (f:Flight)-[:ASSIGNED_TO]->(g:Gate)
RETURN f.flightNumber, g.gateNumber

// Find flights in a terminal
MATCH (f:Flight)-[:ASSIGNED_TO]->(g:Gate)-[:BELONGS_TO]->(t:Terminal {name: 'Terminal 1'})
RETURN f, g
```

### MongoDB Queries
```javascript
// Get today's flights
db.flight_schedules.find({
  date: { $gte: new Date('2024-01-01'), $lt: new Date('2024-01-02') }
})

// Calculate average delay
db.flights.aggregate([
  { $match: { status: 'delayed' } },
  { $group: { _id: null, avgDelay: { $avg: '$delayMinutes' } } }
])
```

---

## 🐛 Common Issues and Solutions

### Issue 1: Cannot connect to databases
**Solution**: Make sure Docker is running and containers are started
```bash
docker ps  # Check running containers
docker-compose up -d  # Start containers
```

### Issue 2: API rate limit exceeded
**Solution**: Implement caching and reduce API call frequency
```javascript
// Cache API responses for 60 seconds
const cache = new Map();
const CACHE_TTL = 60000;
```

### Issue 3: Frontend not updating
**Solution**: Check browser console for errors, verify API endpoints

### Issue 4: Neo4j connection timeout
**Solution**: Increase timeout in driver configuration
```javascript
const driver = neo4j.driver(uri, auth, {
  connectionTimeout: 30000
});
```

---

## 📚 Additional Resources

### Documentation
- **OpenSky API**: https://openskynetwork.github.io/opensky-api/
- **AviationStack**: https://aviationstack.com/documentation
- **Redis**: https://redis.io/docs/
- **Neo4j**: https://neo4j.com/docs/
- **MongoDB**: https://docs.mongodb.com/

### Learning Materials
- Node.js Tutorial: https://nodejs.org/en/docs/guides/
- Docker Tutorial: https://docs.docker.com/get-started/
- JavaScript Async/Await: https://javascript.info/async-await

---

## 🎓 Project Presentation Tips

### For Your Report
1. **Introduction**: Explain the problem (airport safety and efficiency)
2. **Architecture**: Show the 3-database design and why each was chosen
3. **Implementation**: Demonstrate each use case with screenshots
4. **Results**: Show working dashboard and alerts
5. **Conclusion**: Discuss what you learned and future improvements

### Demo Preparation
1. Have all services running before the demo
2. Prepare sample data to show all features
3. Create a script to trigger collision alerts
4. Have backup screenshots in case of technical issues

---

## ✅ Final Checklist

- [ ] All databases are running
- [ ] API keys are configured
- [ ] Backend services are started
- [ ] Frontend is accessible
- [ ] All 7 use cases are implemented
- [ ] Tests are passing
- [ ] Documentation is complete
- [ ] Code is pushed to GitHub
- [ ] Demo is prepared

---

## 🤝 Team Collaboration Tips

1. **Use Git branches**: Each member works on their own branch
2. **Regular meetings**: Sync progress weekly
3. **Code reviews**: Review each other's code before merging
4. **Shared documentation**: Keep this guide updated
5. **Test integration**: Test how your parts work together

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Search error messages online
3. Ask team members
4. Contact your professor/TA

---

**Good luck with your project! 🚀✈️**

---

*Last Updated: February 2026*
*Project Repository: https://github.com/Sameer-kulkarni-sk/AIRPORT-TRACKING-AND-ANALYTICS-SYSTEM-SRH-UNI-KP4SH-*