/**
 * Altitude Check Service - Use Case 4
 * Team Member: Prajwal Vijaykumar
 * 
 * Detects aircraft flying below safe altitude outside airport zones
 */

const dbManager = require('../config/database');
const apiClient = require('../utils/apiClient');

class AltitudeCheckService {
    constructor() {
        this.MIN_SAFE_ALTITUDE_FT = parseFloat(process.env.MIN_SAFE_ALTITUDE_FT || '1000');
        this.checkInterval = null;
    }

    /**
     * Start continuous altitude monitoring
     */
    startMonitoring() {
        const interval = parseInt(process.env.ALTITUDE_CHECK_INTERVAL || '5') * 1000;

        console.log(`📉 Starting altitude monitoring (check every ${interval / 1000}s)`);

        // Initial check
        this.checkLowAltitudeAircraft();

        // Set up periodic checks
        this.checkInterval = setInterval(() => {
            this.checkLowAltitudeAircraft();
        }, interval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            console.log('⏹️  Altitude monitoring stopped');
        }
    }

    /**
     * Check for low-altitude aircraft
     */
    async checkLowAltitudeAircraft() {
        try {
            const redis = dbManager.getRedis();

            // Get all aircraft positions
            const keys = await redis.keys('aircraft:*:position');
            const lowAltitudeAlerts = [];

            for (const key of keys) {
                const data = await redis.hGetAll(key);

                if (!data || !data.callsign || data.on_ground === 'true') {
                    continue;
                }

                const callsign = data.callsign;
                const altitude = parseFloat(data.altitude);
                const latitude = parseFloat(data.latitude);
                const longitude = parseFloat(data.longitude);

                // Check if altitude is below threshold
                if (altitude < this.MIN_SAFE_ALTITUDE_FT) {
                    // Check if aircraft is in airport zone
                    const inAirportZone = await this.isInAirportZone(latitude, longitude);

                    // If NOT in airport zone, create alert
                    if (!inAirportZone) {
                        const alert = {
                            id: `${callsign}-${Date.now()}`,
                            callsign,
                            altitude,
                            position: { latitude, longitude },
                            severity: this.calculateSeverity(altitude),
                            message: 'Aircraft flying below safe altitude outside airport zone',
                            timestamp: new Date().toISOString()
                        };

                        lowAltitudeAlerts.push(alert);
                        await this.storeAlert(alert);
                    }
                }
            }

            if (lowAltitudeAlerts.length > 0) {
                console.log(`📉 ${lowAltitudeAlerts.length} low-altitude alert(s) detected!`);
            }

            return lowAltitudeAlerts;
        } catch (error) {
            console.error('Error checking low-altitude aircraft:', error);
            return [];
        }
    }

    /**
     * Check if coordinates are within airport zone using Neo4j
     */
    async isInAirportZone(latitude, longitude) {
        try {
            const driver = dbManager.getNeo4j();
            const session = driver.session();

            const result = await session.run(`
        MATCH (a:Airport)-[:HAS_ZONE]->(z:Zone)
        WHERE point.distance(
          point({latitude: $lat, longitude: $lon}),
          point({latitude: z.latitude, longitude: z.longitude})
        ) < z.radiusMeters
        RETURN a.name as airport, z.name as zone
      `, { lat: latitude, lon: longitude });

            await session.close();

            return result.records.length > 0;
        } catch (error) {
            console.error('Error checking airport zone:', error);
            // Fallback to simple distance check
            return apiClient.isInAirportZone(latitude, longitude);
        }
    }

    /**
     * Calculate severity based on altitude
     */
    calculateSeverity(altitude) {
        if (altitude < 500) {
            return 'CRITICAL';
        } else if (altitude < 750) {
            return 'HIGH';
        } else {
            return 'MEDIUM';
        }
    }

    /**
     * Store alert in Redis
     */
    async storeAlert(alert) {
        try {
            const redis = dbManager.getRedis();
            const key = `alert:low-altitude:${alert.id}`;

            await redis.set(key, JSON.stringify(alert), {
                EX: 300 // Expire after 5 minutes
            });

            // Also add to active alerts list
            await redis.lPush('alerts:altitude:active', JSON.stringify(alert));
            await redis.lTrim('alerts:altitude:active', 0, 99); // Keep last 100
        } catch (error) {
            console.error('Error storing altitude alert:', error);
        }
    }

    /**
     * Get active altitude alerts
     */
    async getActiveAlerts() {
        try {
            const redis = dbManager.getRedis();
            const alerts = await redis.lRange('alerts:altitude:active', 0, -1);

            return alerts.map(a => JSON.parse(a));
        } catch (error) {
            console.error('Error getting active altitude alerts:', error);
            return [];
        }
    }

    /**
     * Get specific aircraft altitude status
     */
    async getAircraftAltitudeStatus(callsign) {
        try {
            const redis = dbManager.getRedis();
            const key = `aircraft:${callsign}:position`;
            const data = await redis.hGetAll(key);

            if (!data || !data.altitude) {
                return null;
            }

            const altitude = parseFloat(data.altitude);
            const latitude = parseFloat(data.latitude);
            const longitude = parseFloat(data.longitude);
            const inAirportZone = await this.isInAirportZone(latitude, longitude);

            return {
                callsign,
                altitude,
                position: { latitude, longitude },
                inAirportZone,
                isSafe: altitude >= this.MIN_SAFE_ALTITUDE_FT || inAirportZone,
                minSafeAltitude: this.MIN_SAFE_ALTITUDE_FT,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting aircraft altitude status:', error);
            return null;
        }
    }

    /**
     * Get alert history
     */
    async getAlertHistory(limit = 50) {
        try {
            const redis = dbManager.getRedis();
            const keys = await redis.keys('alert:low-altitude:*');

            const alerts = [];
            for (const key of keys.slice(0, limit)) {
                const data = await redis.get(key);
                if (data) {
                    alerts.push(JSON.parse(data));
                }
            }

            return alerts.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        } catch (error) {
            console.error('Error getting altitude alert history:', error);
            return [];
        }
    }
}

module.exports = new AltitudeCheckService();