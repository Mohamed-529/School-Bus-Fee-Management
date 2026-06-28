import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/fleet
 * Retrieve all buses, routes, and transport stops
 */
router.get('/', (req, res: Response) => {
  const state = db.get();
  res.json({
    buses: state.buses,
    routes: state.routes,
    stops: state.stops
  });
});

/**
 * POST /api/fleet/buses
 * Add a new bus to fleet
 */
router.post('/buses', verifyToken, (req: AuthRequest, res: Response) => {
  const state = db.get();
  const newBus = {
    ...req.body,
    id: 'bus_' + Date.now()
  };
  state.buses.push(newBus);
  db.logAction('BUS_ADDED', 'Fleet', `Added vehicle ${newBus.registrationNumber} to fleet`, req.user?.name || 'Admin');
  db.commit();
  res.status(201).json({ bus: newBus });
});

/**
 * POST /api/fleet/routes
 * Add or update transport route
 */
router.post('/routes', verifyToken, (req: AuthRequest, res: Response) => {
  const state = db.get();
  const routeData = req.body;
  if (routeData.id) {
    const idx = state.routes.findIndex(r => r.id === routeData.id);
    if (idx !== -1) {
      state.routes[idx] = { ...state.routes[idx], ...routeData };
      db.commit();
      res.json({ route: state.routes[idx] });
      return;
    }
  }
  const newRoute = {
    ...routeData,
    id: 'route_' + Date.now()
  };
  state.routes.push(newRoute);
  db.logAction('ROUTE_CREATED', 'Fleet', `Created route ${newRoute.name}`, req.user?.name || 'Admin');
  db.commit();
  res.status(201).json({ route: newRoute });
});

export default router;
