/**
 * Replay Service - Use Case 7
 * Team Member: Shahid Sherwani
 * 
 * Replays historical flight routes for analysis
 */

const dbManager = require('../config/database');

class ReplayService {
    /**
     * Get flight telemetry data for replay
     */
    async getFlightTelemetry(flightNumber, date) {
        try {
            const db = dbManager.getMongoDB();

            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const telemetry = await db.collection('flight_telemetry')
                .find({
                    flightNumber: flightNumber.toUpperCase(),
                    timestamp: {
                        $gte: queryDate,
                        $lt: nextDay
                    }
                })
                .sort({ timestamp: 1 })
                .toArray();

            if (telemetry.length === 0) {
                return null;
            }

            return {
                flightNumber: flightNumber.toUpperCase(),
                date: date,
                totalPoints: telemetry.length,
                duration: this.calculateDuration(telemetry),
                telemetry: telemetry.map(point => ({
                    timestamp: point.timestamp,
                    latitude: point.latitude,
                    longitude: point.longitude,
                    altitude: point.altitude,
                    speed: point.speed,
                    heading: point.heading,
                    verticalRate: point.verticalRate
                }))
            };
        } catch (error) {
            console.error('Error getting flight telemetry:', error);
            throw error;
        }
    }

    /**
     * Calculate flight duration
     */
    calculateDuration(telemetry) {
        if (telemetry.length < 2) return 0;

        const start = new Date(telemetry[0].timestamp);
        const end = new Date(telemetry[telemetry.length - 1].timestamp);
        const durationMs = end - start;

        return {
            hours: Math.floor(durationMs / 3600000),
            minutes: Math.floor((durationMs % 3600000) / 60000),
            seconds: Math.floor((durationMs % 60000) / 1000)
        };
    }

    /**
     * Get available flights for replay
     */
    async getAvailableFlights(limit = 50) {
        try {
            const db = dbManager.getMongoDB();

            const flights = await db.collection('flight_telemetry').aggregate([
                {
                    $group: {
                        _id: {
                            flightNumber: '$flightNumber',
                            date: {
                                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                            }
                        },
                        pointCount: { $sum: 1 },
                        firstPoint: { $first: '$timestamp' },
                        lastPoint: { $last: '$timestamp' }
                    }
                },
                {
                    $sort: { firstPoint: -1 }
                },
                {
                    $limit: limit
                }
            ]).toArray();

            return flights.map(f => ({
                flightNumber: f._id.flightNumber,
                date: f._id.date,
                pointCount: f.pointCount,
                firstTimestamp: f.firstPoint,
                lastTimestamp: f.lastPoint
            }));
        } catch (error) {
            console.error('Error getting available flights:', error);
            throw error;
        }
    }

    /**
     * Get telemetry segment (for streaming)
     */
    async getTelemetrySegment(flightNumber, date, startIndex, count = 100) {
        try {
            const db = dbManager.getMongoDB();

            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const segment = await db.collection('flight_telemetry')
                .find({
                    flightNumber: flightNumber.toUpperCase(),
                    timestamp: {
                        $gte: queryDate,
                        $lt: nextDay
                    }
                })
                .sort({ timestamp: 1 })
                .skip(startIndex)
                .limit(count)
                .toArray();

            return segment.map(point => ({
                timestamp: point.timestamp,
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: point.altitude,
                speed: point.speed,
                heading: point.heading
            }));
        } catch (error) {
            console.error('Error getting telemetry segment:', error);
            throw error;
        }
    }

    /**
     * Get flight path summary
     */
    async getFlightPathSummary(flightNumber, date) {
        try {
            const db = dbManager.getMongoDB();

            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const summary = await db.collection('flight_telemetry').aggregate([
                {
                    $match: {
                        flightNumber: flightNumber.toUpperCase(),
                        timestamp: {
                            $gte: queryDate,
                            $lt: nextDay
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        maxAltitude: { $max: '$altitude' },
                        minAltitude: { $min: '$altitude' },
                        avgSpeed: { $avg: '$speed' },
                        maxSpeed: { $max: '$speed' },
                        totalPoints: { $sum: 1 },
                        firstPoint: { $first: '$$ROOT' },
                        lastPoint: { $last: '$$ROOT' }
                    }
                }
            ]).toArray();

            if (summary.length === 0) {
                return null;
            }

            const data = summary[0];

            return {
                flightNumber: flightNumber.toUpperCase(),
                date: date,
                departure: {
                    latitude: data.firstPoint.latitude,
                    longitude: data.firstPoint.longitude,
                    timestamp: data.firstPoint.timestamp
                },
                arrival: {
                    latitude: data.lastPoint.latitude,
                    longitude: data.lastPoint.longitude,
                    timestamp: data.lastPoint.timestamp
                },
                statistics: {
                    maxAltitude: Math.round(data.maxAltitude),
                    minAltitude: Math.round(data.minAltitude),
                    averageSpeed: Math.round(data.avgSpeed),
                    maxSpeed: Math.round(data.maxSpeed),
                    totalDataPoints: data.totalPoints
                }
            };
        } catch (error) {
            console.error('Error getting flight path summary:', error);
            throw error;
        }
    }

    /**
     * Store telemetry data (for testing/seeding)
     */
    async storeTelemetry(flightNumber, telemetryPoints) {
        try {
            const db = dbManager.getMongoDB();

            const documents = telemetryPoints.map(point => ({
                flightNumber: flightNumber.toUpperCase(),
                timestamp: new Date(point.timestamp),
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: point.altitude,
                speed: point.speed,
                heading: point.heading,
                verticalRate: point.verticalRate || 0
            }));

            await db.collection('flight_telemetry').insertMany(documents);

            console.log(`✅ Stored ${documents.length} telemetry points for ${flightNumber}`);
        } catch (error) {
            console.error('Error storing telemetry:', error);
            throw error;
        }
    }
}

module.exports = new ReplayService();