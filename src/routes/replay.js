/**
 * Replay Routes - Use Case 7
 * Team Member: Shahid Sherwani
 */

const express = require('express');
const router = express.Router();
const replayService = require('../services/replayService');

router.get('/:flightNumber/:date', async (req, res) => {
    try {
        const { flightNumber, date } = req.params;
        const telemetry = await replayService.getFlightTelemetry(flightNumber, date);
        if (!telemetry) {
            return res.status(404).json({ success: false, error: 'Flight telemetry not found' });
        }
        res.json({ success: true, data: telemetry });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/flights', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const flights = await replayService.getAvailableFlights(limit);
        res.json({ success: true, count: flights.length, data: flights });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:flightNumber/:date/segment', async (req, res) => {
    try {
        const { flightNumber, date } = req.params;
        const startIndex = parseInt(req.query.start) || 0;
        const count = parseInt(req.query.count) || 100;
        const segment = await replayService.getTelemetrySegment(flightNumber, date, startIndex, count);
        res.json({ success: true, count: segment.length, data: segment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:flightNumber/:date/summary', async (req, res) => {
    try {
        const { flightNumber, date } = req.params;
        const summary = await replayService.getFlightPathSummary(flightNumber, date);
        if (!summary) {
            return res.status(404).json({ success: false, error: 'Flight path not found' });
        }
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;