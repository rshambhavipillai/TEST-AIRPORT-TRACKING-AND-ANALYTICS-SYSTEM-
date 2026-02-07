# 👥 Team Responsibilities & Task Distribution

## Project: Airport Tracking and Analytics System

---

## 📋 Overview

This document clearly defines what each team member needs to implement. Each person is responsible for **ONE use case** with specific deliverables.

---

## 🎯 Team Member 1: Sameer Kulkarni

### Use Case: Monitor Live Flight & Gate Status

### Your Responsibilities:
1. **Backend Service** (`services/flightMonitorService.js`)
   - Fetch live flight data from OpenSky API
   - Store flight status in Redis
   - Query gate assignments from Neo4j
   - Retrieve schedules from MongoDB
   - Combine all data for dashboard

2. **API Endpoints** (`routes/flightMonitor.js`)
   - `GET /api/flights/live` - Return all active flights
   - `GET /api/flights/:flightNumber` - Return specific flight details
   - `GET /api/gates/status` - Return gate occupancy

3. **Frontend Dashboard** (`public/dashboard.html` + `public/js/dashboard.js`)
   - Display live flight map
   - Show flight table with status
   - Highlight delayed flights
   - Auto-refresh every 10 seconds

### Deliverables:
- [ ] Working flight monitoring service
- [ ] 3 API endpoints tested and working
- [ ] Interactive dashboard with map
- [ ] Documentation of your code

### Database Interactions:
- **Redis**: Read/Write live flight status
- **Neo4j**: Query flight-gate relationships
- **MongoDB**: Read flight schedules

### Testing:
```bash
# Test your endpoints
curl http://localhost:8080/api/flights/live
curl http://localhost:8080/api/flights/AA123
curl http://localhost:8080/api/gates/status
```

---

## 🎯 Team Member 2: Harjot Singh

### Use Case: Monitor Airport KPIs

### Your Responsibilities:
1. **Backend Service** (`services/kpiService.js`)
   - Calculate real-time KPIs from Redis counters
   - Aggregate historical data from MongoDB
   - Compute on-time percentage
   - Calculate average delays
   - Track flight activity metrics

2. **API Endpoints** (`routes/kpi.js`)
   - `GET /api/kpi/summary` - Return current KPI snapshot
   - `GET /api/kpi/delays` - Return delay statistics
   - `GET /api/kpi/trends` - Return performance trends

3. **Frontend Dashboard** (`public/kpi.html` + `public/js/kpi.js`)
   - Display KPI cards (total flights, delays, on-time %)
   - Show charts for trends
   - Update metrics in real-time

### Deliverables:
- [ ] KPI calculation service
- [ ] 3 API endpoints for metrics
- [ ] KPI dashboard with charts
- [ ] Documentation

### Database Interactions:
- **Redis**: Read counters (delays, total flights)
- **MongoDB**: Aggregate historical performance data

### Testing:
```bash
curl http://localhost:8080/api/kpi/summary
curl http://localhost:8080/api/kpi/delays
```

---

## 🎯 Team Member 3: Shambhavi Pillai

### Use Case: Mid-Air Collision Detection

### Your Responsibilities:
1. **Backend Service** (`services/collisionService.js`)
   - Read aircraft positions from Redis
   - Calculate distance between all aircraft pairs
   - Check altitude separation
   - Generate alerts when distance < 5km AND altitude diff < 1000ft
   - Store alerts in Redis

2. **API Endpoints** (`routes/collision.js`)
   - `GET /api/alerts/collision` - Return active collision alerts
   - `GET /api/alerts/collision/history` - Return past alerts

3. **Frontend Integration** (`public/js/collisionAlerts.js`)
   - Display collision warnings on map
   - Show alert notifications
   - Highlight affected aircraft

### Deliverables:
- [ ] Collision detection algorithm
- [ ] Background service running continuously
- [ ] Alert API endpoints
- [ ] Visual warnings on dashboard
- [ ] Documentation

### Database Interactions:
- **Redis**: Read aircraft positions, write alerts

### Key Algorithm:
```javascript
// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Testing:
```bash
# Run collision detection service
npm run collision-service

# Test API
curl http://localhost:8080/api/alerts/collision
```

---

## 🎯 Team Member 4: Prajwal Vijaykumar

### Use Case: Detect Low-Altitude Aircraft

### Your Responsibilities:
1. **Backend Service** (`services/altitudeCheckService.js`)
   - Read aircraft positions and altitude from Redis
   - Check if altitude < 1000 ft
   - Verify with Neo4j if aircraft is in airport zone
   - Generate alerts for low-altitude aircraft OUTSIDE airport zones
   - Store alerts in Redis

2. **API Endpoints** (`routes/altitude.js`)
   - `GET /api/alerts/altitude` - Return low-altitude alerts
   - `GET /api/alerts/altitude/aircraft/:callsign` - Check specific aircraft

3. **Frontend Integration** (`public/js/altitudeAlerts.js`)
   - Change aircraft icon color on map (red for low altitude)
   - Show altitude warnings
   - Display safe zones on map

### Deliverables:
- [ ] Altitude monitoring service
- [ ] Airport zone verification logic
- [ ] Alert API endpoints
- [ ] Visual warnings on map
- [ ] Documentation

### Database Interactions:
- **Redis**: Read aircraft altitude and position
- **Neo4j**: Query airport zones and boundaries

### Neo4j Query Example:
```cypher
// Check if aircraft is in airport zone
MATCH (a:Airport)-[:HAS_ZONE]->(z:Zone)
WHERE point.distance(
  point({latitude: $lat, longitude: $lon}),
  point({latitude: z.latitude, longitude: z.longitude})
) < z.radius
RETURN a.name, z.name
```

### Testing:
```bash
npm run altitude-service
curl http://localhost:8080/api/alerts/altitude
```

---

## 🎯 Team Member 5: Kartheek Tatagari

### Use Case: Passenger Flight Information

### Your Responsibilities:
1. **Backend Service** (`services/passengerService.js`)
   - Search flights by flight number
   - Retrieve schedule from MongoDB
   - Get live status from Redis
   - Get gate assignment from Neo4j
   - Combine all information for passenger

2. **API Endpoints** (`routes/passenger.js`)
   - `GET /api/passenger/flight/:flightNumber` - Search by flight number
   - `GET /api/passenger/search?query=...` - Search flights

3. **Frontend Page** (`public/passenger.html` + `public/js/passenger.js`)
   - Search box for flight number
   - Display flight details (status, gate, terminal, delay)
   - Show departure/arrival times
   - User-friendly interface for passengers

### Deliverables:
- [ ] Passenger information service
- [ ] Search API endpoints
- [ ] Passenger-facing web page
- [ ] Mobile-responsive design
- [ ] Documentation

### Database Interactions:
- **MongoDB**: Read flight schedules
- **Redis**: Read live status
- **Neo4j**: Read gate assignments

### Example Response:
```json
{
  "flightNumber": "AA123",
  "airline": "American Airlines",
  "status": "On Time",
  "gate": "A12",
  "terminal": "Terminal 1",
  "scheduledDeparture": "2024-01-15T10:30:00Z",
  "delay": 0
}
```

### Testing:
```bash
curl http://localhost:8080/api/passenger/flight/AA123
```

---

## 🎯 Team Member 6: Smitha Anoop

### Use Case: View Flight History

### Your Responsibilities:
1. **Backend Service** (`services/historyService.js`)
   - Query historical flights from MongoDB
   - Filter by date range, airline, status
   - Calculate statistics (avg delay, on-time %)
   - Export data for reporting

2. **API Endpoints** (`routes/history.js`)
   - `GET /api/history/flights?startDate=...&endDate=...` - Get flight history
   - `GET /api/history/statistics?period=...` - Get statistics
   - `GET /api/history/export?format=csv` - Export data

3. **Frontend Page** (`public/history.html` + `public/js/history.js`)
   - Date range picker
   - Filter options (airline, status)
   - Table showing historical flights
   - Charts showing trends
   - Export button

### Deliverables:
- [ ] History query service
- [ ] Filter and search functionality
- [ ] Statistics calculation
- [ ] History viewer page
- [ ] Data export feature
- [ ] Documentation

### Database Interactions:
- **MongoDB**: Read from `flight_history` collection

### MongoDB Query Example:
```javascript
db.flight_history.find({
  date: { 
    $gte: new Date('2024-01-01'), 
    $lte: new Date('2024-01-31') 
  },
  airline: 'American Airlines'
}).sort({ date: -1 })
```

### Testing:
```bash
curl "http://localhost:8080/api/history/flights?startDate=2024-01-01&endDate=2024-01-31"
```

---

## 🎯 Team Member 7: Shahid Sherwani

### Use Case: Replay Flight Route

### Your Responsibilities:
1. **Backend Service** (`services/replayService.js`)
   - Retrieve flight telemetry from MongoDB
   - Get position updates over time
   - Prepare data for animation
   - Support playback controls (play, pause, speed)

2. **API Endpoints** (`routes/replay.js`)
   - `GET /api/replay/:flightNumber/:date` - Get flight telemetry
   - `GET /api/replay/flights` - List available replays

3. **Frontend Page** (`public/replay.html` + `public/js/replay.js`)
   - Map with flight path visualization
   - Playback controls (play, pause, speed)
   - Timeline slider
   - Display telemetry data (altitude, speed, heading)
   - Animate aircraft movement

### Deliverables:
- [ ] Replay data service
- [ ] Telemetry API endpoints
- [ ] Interactive replay page
- [ ] Animation controls
- [ ] Timeline visualization
- [ ] Documentation

### Database Interactions:
- **MongoDB**: Read from `flight_telemetry` collection

### Telemetry Data Structure:
```javascript
{
  flightNumber: "AA123",
  date: "2024-01-15",
  telemetry: [
    {
      timestamp: "2024-01-15T10:30:00Z",
      latitude: 50.0379,
      longitude: 8.5622,
      altitude: 5000,
      speed: 250,
      heading: 90
    },
    // ... more points
  ]
}
```

### Frontend Animation:
```javascript
class FlightReplay {
  play() {
    this.interval = setInterval(() => {
      const point = this.data[this.currentIndex];
      this.updateMarker(point);
      this.drawPath(point);
      this.currentIndex++;
    }, 1000 / this.speed);
  }
}
```

### Testing:
```bash
curl http://localhost:8080/api/replay/AA123/2024-01-15
```

---

## 📊 Integration Points

### How Your Work Connects:

```
Sameer's Dashboard
    ↓ (displays)
Harjot's KPIs + Shambhavi's Alerts + Prajwal's Warnings
    ↓ (uses data from)
All Team Members' Services
    ↓ (store/retrieve from)
Redis + Neo4j + MongoDB
```

---

## ✅ Definition of Done

For each team member, your work is complete when:

1. **Code Quality**
   - [ ] Code is clean and well-commented
   - [ ] Follows JavaScript best practices
   - [ ] No console errors

2. **Functionality**
   - [ ] All features work as described
   - [ ] API endpoints return correct data
   - [ ] Frontend displays data properly

3. **Testing**
   - [ ] Manual testing completed
   - [ ] All test cases pass
   - [ ] Edge cases handled

4. **Documentation**
   - [ ] Code comments added
   - [ ] API endpoints documented
   - [ ] README section updated

5. **Integration**
   - [ ] Works with other team members' code
   - [ ] Database connections successful
   - [ ] No conflicts with main branch

---

## 🤝 Collaboration Guidelines

### Git Workflow:
```bash
# 1. Create your branch
git checkout -b feature/your-name-use-case

# 2. Work on your code
git add .
git commit -m "Add: flight monitoring service"

# 3. Push to your branch
git push origin feature/your-name-use-case

# 4. Create Pull Request on GitHub
# 5. Wait for review from team
# 6. Merge after approval
```

### Communication:
- **Daily standup**: Share progress and blockers
- **Code reviews**: Review each other's pull requests
- **Help each other**: If stuck, ask team members
- **Document issues**: Use GitHub Issues for bugs

---

## 📅 Timeline

### Week 1: Setup & Individual Development
- Day 1-2: Environment setup, understand requirements
- Day 3-5: Implement your backend service
- Day 6-7: Create API endpoints

### Week 2: Frontend & Integration
- Day 1-3: Build your frontend page
- Day 4-5: Test integration with databases
- Day 6-7: Integration testing with team

### Week 3: Testing & Documentation
- Day 1-3: Bug fixes and improvements
- Day 4-5: Write documentation
- Day 6-7: Final testing and demo preparation

---

## 🆘 Getting Help

### If You're Stuck:

1. **Check Documentation**
   - Read PROJECT_GUIDE.md
   - Check API documentation
   - Review code examples

2. **Ask Team Members**
   - Post in team chat
   - Schedule pair programming session
   - Review similar code from teammates

3. **Search Online**
   - Stack Overflow
   - Official documentation
   - GitHub issues

4. **Contact Professor/TA**
   - For major blockers
   - For clarification on requirements

---

## 🎓 Learning Resources

### For Everyone:
- **Node.js**: https://nodejs.org/en/docs/
- **Express.js**: https://expressjs.com/
- **JavaScript Async/Await**: https://javascript.info/async-await

### Database-Specific:
- **Redis**: https://redis.io/docs/
- **MongoDB**: https://docs.mongodb.com/
- **Neo4j**: https://neo4j.com/docs/

### Frontend:
- **HTML/CSS**: https://developer.mozilla.org/
- **JavaScript**: https://javascript.info/
- **Leaflet Maps**: https://leafletjs.com/

---

**Remember**: You're not alone! This is a team project. Help each other succeed! 🚀

---

*Last Updated: February 2026*