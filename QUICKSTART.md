# 🚀 Quick Start Guide - Airport Tracking System

## Get Your Project Running in 10 Minutes!

---

## ✅ Prerequisites Check

Before starting, make sure you have:

- [ ] **Node.js 16+** installed ([Download](https://nodejs.org/))
- [ ] **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop/))
- [ ] **Git** installed ([Download](https://git-scm.com/))
- [ ] A code editor (VS Code recommended)

---

## 📥 Step 1: Get the Code

```bash
# Clone the repository
git clone https://github.com/Sameer-kulkarni-sk/AIRPORT-TRACKING-AND-ANALYTICS-SYSTEM-SRH-UNI-KP4SH-
cd AIRPORT-TRACKING-AND-ANALYTICS-SYSTEM-SRH-UNI-KP4SH-

# Or if you already have the code, just navigate to the folder
cd /path/to/your/project
```

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (Express, Redis, MongoDB drivers, etc.)

**Expected output:** ✅ "added XXX packages"

---

## 🔧 Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
code .env  # or use any text editor
```

**Minimum required configuration:**

```env
# Leave these as default for local development
REDIS_HOST=localhost
REDIS_PORT=6379
MONGODB_URI=mongodb://admin:airport123@localhost:27017/airport_system?authSource=admin
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=airport123

# Optional: Add your AviationStack API key (get free key at aviationstack.com)
AVIATIONSTACK_API_KEY=your_key_here

# Airport configuration (default: Frankfurt)
AIRPORT_ICAO=EDDF
AIRPORT_LATITUDE=50.0379
AIRPORT_LONGITUDE=8.5622
```

---

## 🐳 Step 4: Start Databases

```bash
# Start all databases with Docker
docker-compose up -d
```

**This starts:**
- Redis (port 6379)
- MongoDB (port 27017)
- Neo4j (port 7474 for web, 7687 for bolt)

**Check if running:**
```bash
docker-compose ps
```

You should see 3 containers running ✅

**Wait 30 seconds** for databases to fully initialize.

---

## 🗄️ Step 5: Initialize Databases

```bash
# Create database schema and structure
node scripts/setup.js
```

**Expected output:**
```
🚀 Starting database setup...
🔗 Setting up Neo4j schema...
✅ Neo4j schema created successfully
📚 Setting up MongoDB collections...
✅ MongoDB collections and indexes created
📦 Setting up Redis...
✅ Redis initialized
✅ Database setup completed successfully!
```

---

## 🌱 Step 6: Add Sample Data

```bash
# Seed the databases with test data
node scripts/seedData.js
```

**Expected output:**
```
🌱 Starting data seeding...
📅 Seeding flight schedules...
✅ Inserted 8 flight schedules
📜 Seeding flight history...
✅ Inserted 240 historical records
🛫 Seeding flight telemetry...
✅ Inserted 100 telemetry points
🔗 Seeding Neo4j flight-gate assignments...
✅ Created 8 flight-gate assignments
📦 Seeding Redis live data...
✅ Seeded 3 live aircraft positions
✅ Data seeding completed successfully!
```

---

## 🚀 Step 7: Start the Server

```bash
npm start
```

**Expected output:**
```
🚀 Starting Airport Tracking System...
📍 Environment: development
🔌 Connecting to databases...
📦 Redis connected
✅ Redis connection verified
✅ MongoDB connected
✅ Neo4j connected
✅ All databases connected successfully!

✈️  Airport Tracking System is running!

🌐 Server: http://localhost:8080
📊 Dashboard: http://localhost:8080/dashboard
📈 KPIs: http://localhost:8080/kpi
🔍 Passenger: http://localhost:8080/passenger
📜 History: http://localhost:8080/history
🎬 Replay: http://localhost:8080/replay
💚 Health: http://localhost:8080/health

Press Ctrl+C to stop
```

---

## 🌐 Step 8: Open Your Browser

Visit: **http://localhost:8080**

You should see the main landing page with links to all features! 🎉

---

## 🧪 Step 9: Test the System

### Test 1: Check System Health
```bash
curl http://localhost:8080/health
```

**Expected:** `{"status":"ok", ...}`

### Test 2: Get Live Flights
```bash
curl http://localhost:8080/api/flights/live
```

**Expected:** JSON with flight data

### Test 3: Check KPIs
```bash
curl http://localhost:8080/api/kpi/summary
```

**Expected:** Statistics about flights

### Test 4: Open Dashboard
Visit: http://localhost:8080/dashboard

You should see a flight monitoring interface!

---

## 🎯 What Each Team Member Should Do Now

### Sameer (Flight Monitor)
1. Open http://localhost:8080/dashboard
2. Check if flights are displayed
3. Test: `curl http://localhost:8080/api/flights/live`

### Harjot (KPIs)
1. Open http://localhost:8080/kpi
2. Check if metrics are shown
3. Test: `curl http://localhost:8080/api/kpi/summary`

### Shambhavi (Collision Detection)
1. Test: `curl http://localhost:8080/api/alerts/collision`
2. Check for collision alerts
3. Verify service is running

### Prajwal (Altitude Check)
1. Test: `curl http://localhost:8080/api/alerts/altitude`
2. Check for altitude warnings
3. Verify zone detection

### Kartheek (Passenger Info)
1. Open http://localhost:8080/passenger
2. Search for flight: LH400
3. Test: `curl http://localhost:8080/api/passenger/flight/LH400`

### Smitha (History)
1. Open http://localhost:8080/history
2. View historical data
3. Test: `curl http://localhost:8080/api/history/flights`

### Shahid (Replay)
1. Open http://localhost:8080/replay
2. Check available flights
3. Test: `curl http://localhost:8080/api/replay/flights`

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to databases"

**Solution:**
```bash
# Check if Docker is running
docker ps

# Restart databases
docker-compose down
docker-compose up -d

# Wait 30 seconds, then try again
```

### Problem: "Port 8080 already in use"

**Solution:**
```bash
# Change port in .env file
PORT=3000

# Or kill the process using port 8080
# On Mac/Linux:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Problem: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Redis connection failed"

**Solution:**
```bash
# Check Redis container
docker logs airport-redis

# Restart Redis
docker-compose restart redis
```

### Problem: "MongoDB authentication failed"

**Solution:**
```bash
# Check MongoDB container
docker logs airport-mongodb

# Verify credentials in .env match docker-compose.yml
```

---

## 📊 Verify Everything Works

Run this checklist:

- [ ] Server starts without errors
- [ ] http://localhost:8080 loads
- [ ] http://localhost:8080/health shows "ok"
- [ ] http://localhost:8080/dashboard displays
- [ ] API endpoints return data (test with curl)
- [ ] No red errors in terminal
- [ ] Docker containers are running

---

## 🎓 Next Steps

1. **Read the documentation:**
   - `PROJECT_GUIDE.md` - Detailed implementation guide
   - `TEAM_RESPONSIBILITIES.md` - Your specific tasks
   - `SIMPLE_EXPLANATION.md` - Beginner-friendly explanations

2. **Explore the code:**
   - `src/services/` - Backend logic
   - `src/routes/` - API endpoints
   - `public/` - Frontend files

3. **Start developing:**
   - Find your use case in `TEAM_RESPONSIBILITIES.md`
   - Implement your features
   - Test your changes

4. **Get live data (optional):**
   - Sign up for AviationStack API key
   - Add key to `.env`
   - Restart server

---

## 🆘 Need Help?

1. **Check logs:**
   ```bash
   # Server logs (in terminal where npm start is running)
   
   # Database logs
   docker-compose logs redis
   docker-compose logs mongodb
   docker-compose logs neo4j
   ```

2. **Common commands:**
   ```bash
   # Stop server: Ctrl+C
   # Stop databases: docker-compose down
   # Restart everything: docker-compose restart
   # View all containers: docker ps -a
   ```

3. **Ask your team:**
   - Post in team chat
   - Review code together
   - Pair programming session

4. **Check documentation:**
   - README.md
   - PROJECT_GUIDE.md
   - API documentation in code comments

---

## 🎉 Success!

If you've reached this point and everything works, congratulations! 🎊

You now have a fully functional Airport Tracking System running locally!

**What you can do:**
- ✅ Monitor live flights
- ✅ View performance metrics
- ✅ Check safety alerts
- ✅ Search flight information
- ✅ Analyze historical data
- ✅ Replay flight paths

**Ready to develop?** Check `TEAM_RESPONSIBILITIES.md` for your tasks!

---

## 📝 Quick Reference

### Start Everything
```bash
docker-compose up -d  # Start databases
npm start             # Start server
```

### Stop Everything
```bash
# Press Ctrl+C in server terminal
docker-compose down   # Stop databases
```

### Reset Everything
```bash
docker-compose down -v  # Remove all data
docker-compose up -d    # Start fresh
node scripts/setup.js   # Reinitialize
node scripts/seedData.js # Reseed data
npm start               # Start server
```

### Useful URLs
- Main: http://localhost:8080
- Dashboard: http://localhost:8080/dashboard
- Health: http://localhost:8080/health
- Neo4j Browser: http://localhost:7474

---

**Happy Coding! 🚀✈️**