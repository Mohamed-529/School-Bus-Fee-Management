import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { BusModel } from '../models/Bus';
import { RouteModel } from '../models/Route';
import { StopModel } from '../models/Stop';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/fleet
 * Retrieve all buses, routes, and transport stops from MongoDB
 */
router.get('/', async (req, res: Response) => {
  try {
    const buses = await BusModel.find().sort({ busNumber: 1 });
    const routes = await RouteModel.find().sort({ name: 1 });
    const stops = await StopModel.find().sort({ order: 1 });
    res.json({ buses, routes, stops });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch fleet data', details: err.message });
  }
});

/**
 * POST /api/fleet/buses
 * Add a new bus to fleet
 */
router.post('/buses', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const busData = req.body;

    // Validate phone: Driver Phone must be exactly 10 digits
    const digits = (busData.driverPhone || '').replace(/\D/g, '');
    const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
    if (coreDigits.length !== 10) {
      res.status(400).json({ error: 'Driver Phone Number must be exactly 10 digits.' });
      return;
    }

    // Validate registration number: must be at least 5 alphanumeric characters
    const regNo = (busData.registrationNumber || '').trim();
    if (regNo.length < 5) {
      res.status(400).json({ error: 'Registration Number must be at least 5 characters long.' });
      return;
    }

    // Validate startingTime: must be in AM only
    const time = (busData.startingTime || '').trim();
    if (!time.toUpperCase().endsWith('AM')) {
      res.status(400).json({ error: 'Starting Time must be in AM (morning schedule) only.' });
      return;
    }

    const newBus = new BusModel({
      ...busData,
      id: busData.id || 'bus_' + Date.now(),
      driverPhone: `+91 ${coreDigits}`,
      registrationNumber: regNo,
      startingTime: time
    });

    await newBus.save();

    await db.logAction(
      'BUS_ADDED', 
      'Fleet', 
      `Added vehicle ${newBus.registrationNumber} to fleet`, 
      req.user?.name || 'Admin'
    );

    res.status(201).json({ bus: newBus });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create bus record', details: err.message });
  }
});

/**
 * PUT /api/fleet/buses/:id
 * Update an existing bus in fleet
 */
router.put('/buses/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.driverPhone) {
      const digits = updates.driverPhone.replace(/\D/g, '');
      const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
      if (coreDigits.length !== 10) {
        res.status(400).json({ error: 'Driver Phone Number must be exactly 10 digits.' });
        return;
      }
      updates.driverPhone = `+91 ${coreDigits}`;
    }

    if (updates.registrationNumber) {
      const regNo = updates.registrationNumber.trim();
      if (regNo.length < 5) {
        res.status(400).json({ error: 'Registration Number must be at least 5 characters long.' });
        return;
      }
      updates.registrationNumber = regNo;
    }

    if (updates.startingTime) {
      const time = updates.startingTime.trim();
      if (!time.toUpperCase().endsWith('AM')) {
        res.status(400).json({ error: 'Starting Time must be in AM (morning schedule) only.' });
        return;
      }
      updates.startingTime = time;
    }

    const bus = await BusModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!bus) {
      res.status(404).json({ error: 'Bus record not found' });
      return;
    }

    await db.logAction(
      'BUS_UPDATED', 
      'Fleet', 
      `Updated vehicle: ${bus.busNumber}`, 
      req.user?.name || 'Admin'
    );

    res.json({ bus });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update bus', details: err.message });
  }
});

/**
 * DELETE /api/fleet/buses/:id
 * Remove a bus from fleet
 */
router.delete('/buses/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await BusModel.findOneAndDelete({ id });
    if (!bus) {
      res.status(404).json({ error: 'Bus not found' });
      return;
    }

    await db.logAction(
      'BUS_DELETED', 
      'Fleet', 
      `Removed vehicle ${bus.registrationNumber} from fleet`, 
      req.user?.name || 'Admin'
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete bus', details: err.message });
  }
});

/**
 * POST /api/fleet/routes
 * Add a new route
 */
router.post('/routes', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const routeData = req.body;
    
    const newRoute = new RouteModel({
      ...routeData,
      id: routeData.id || 'route_' + Date.now()
    });

    await newRoute.save();

    await db.logAction(
      'ROUTE_CREATED', 
      'Fleet', 
      `Created route ${newRoute.name}`, 
      req.user?.name || 'Admin'
    );

    res.status(201).json({ route: newRoute });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create route', details: err.message });
  }
});

/**
 * PUT /api/fleet/routes/:id
 * Update or modify an existing route
 */
router.put('/routes/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const route = await RouteModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!route) {
      res.status(404).json({ error: 'Route not found' });
      return;
    }

    await db.logAction(
      'ROUTE_UPDATED', 
      'Fleet', 
      `Updated route ${route.name}`, 
      req.user?.name || 'Admin'
    );

    res.json({ route });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update route', details: err.message });
  }
});

/**
 * DELETE /api/fleet/routes/:id
 * Delete a route and all its stops from MongoDB
 */
router.delete('/routes/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const route = await RouteModel.findOneAndDelete({ id });
    if (!route) {
      res.status(404).json({ error: 'Route not found' });
      return;
    }

    // Cascade delete all stops associated with this route
    await StopModel.deleteMany({ routeId: id });

    await db.logAction(
      'ROUTE_DELETED', 
      'Fleet', 
      `Deleted route ${route.name} and cascaded its stops`, 
      req.user?.name || 'Admin'
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete route', details: err.message });
  }
});

/**
 * POST /api/fleet/stops
 * Create a new stop for a route
 */
router.post('/stops', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const stopData = req.body;

    const time = (stopData.pickupTime || '').trim();
    if (!time.toUpperCase().endsWith('AM')) {
      res.status(400).json({ error: 'Pickup Time must be in AM only.' });
      return;
    }

    const newStop = new StopModel({
      ...stopData,
      id: stopData.id || 'stop_' + Date.now(),
      pickupTime: time
    });

    await newStop.save();
    res.status(201).json({ stop: newStop });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create stop', details: err.message });
  }
});

/**
 * PUT /api/fleet/stops/:id
 * Update Stop parameters
 */
router.put('/stops/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.pickupTime) {
      const time = updates.pickupTime.trim();
      if (!time.toUpperCase().endsWith('AM')) {
        res.status(400).json({ error: 'Pickup Time must be in AM only.' });
        return;
      }
      updates.pickupTime = time;
    }

    const stop = await StopModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!stop) {
      res.status(404).json({ error: 'Stop not found' });
      return;
    }

    res.json({ stop });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update stop', details: err.message });
  }
});

/**
 * DELETE /api/fleet/stops/:id
 * Delete a route stop
 */
router.delete('/stops/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const stop = await StopModel.findOneAndDelete({ id });
    if (!stop) {
      res.status(404).json({ error: 'Stop not found' });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete stop', details: err.message });
  }
});

/**
 * POST /api/fleet/stops/reorder
 * Save sequence order of route stops
 */
router.post('/stops/reorder', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { routeId, orderedStopIds } = req.body;
    if (!routeId || !Array.isArray(orderedStopIds)) {
      res.status(400).json({ error: 'routeId and orderedStopIds are required' });
      return;
    }

    // Loop through the array and update order sequentially in DB
    for (let index = 0; index < orderedStopIds.length; index++) {
      const stopId = orderedStopIds[index];
      await StopModel.findOneAndUpdate({ id: stopId, routeId }, { order: index + 1 });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reorder stops', details: err.message });
  }
});

export default router;
