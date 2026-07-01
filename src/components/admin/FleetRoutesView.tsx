import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Bus, Route, Stop } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  Bus as BusIcon, MapPin, Plus, Edit2, Trash2, Users, 
  ChevronUp, ChevronDown, Clock, HelpCircle, X, Search, 
  Check, AlertTriangle, ArrowUpDown, ChevronRight, CheckCircle2 
} from 'lucide-react';

export const FleetRoutesView: React.FC = () => {
  const { 
    buses, routes, stops, students, 
    addBus, updateBus, deleteBus, 
    addRoute, updateRoute, deleteRoute, 
    addStop, deleteStop, updateStop,
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'stops'>('buses');
  
  // Modals
  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Deletion States
  const [deletingBusId, setDeletingBusId] = useState<string | null>(null);
  const [deletingBusNumber, setDeletingBusNumber] = useState<string>('');

  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);
  const [deletingRouteName, setDeletingRouteName] = useState<string>('');

  // Form states for Bus Modal
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 35,
    driverName: '',
    driverPhone: '+91 ',
    startingLocation: 'Kundrathur',
    startingTime: '06:30 AM',
    destination: 'School Campus',
    status: 'active' as 'active' | 'inactive',
  });

  // Form states for Route Modal
  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    assignedBusId: '',
  });

  // Local state for managing stops inside Route Modal
  interface TempStop {
    id?: string;
    stopName: string;
    pickupTime: string;
    feePerStop: number;
  }
  const [routeStops, setRouteStops] = useState<TempStop[]>([
    { stopName: '', pickupTime: '07:00 AM', feePerStop: 500 }
  ]);

  // Expanded route cards
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Time parsing helper to compare AM/PM chronological order
  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Open Bus Modal
  const handleOpenBusModal = (bus?: Bus) => {
    if (bus) {
      setEditingBus(bus);
      setBusForm({
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
        capacity: bus.capacity,
        driverName: bus.driverName,
        driverPhone: bus.driverPhone.replace(/\D/g, '').slice(-10),
        startingLocation: bus.startingLocation || 'Kundrathur',
        startingTime: bus.startingTime || '06:30 AM',
        destination: bus.destination || 'School Campus',
        status: bus.status || 'active',
      });
    } else {
      setEditingBus(null);
      setBusForm({
        busNumber: '',
        registrationNumber: '',
        capacity: 35,
        driverName: '',
        driverPhone: '',
        startingLocation: 'Kundrathur',
        startingTime: '06:30 AM',
        destination: 'School Campus',
        status: 'active',
      });
    }
    setShowBusModal(true);
  };

  // Save Bus
  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!busForm.busNumber.trim()) {
      addToast('Validation Failed', 'error', 'Bus number is required');
      return;
    }
    if (!busForm.registrationNumber.trim()) {
      addToast('Validation Failed', 'error', 'Registration number is required');
      return;
    }
    if (!busForm.driverName.trim()) {
      addToast('Validation Failed', 'error', 'Driver name is required');
      return;
    }
    const cleanPhone = busForm.driverPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      addToast('Validation Failed', 'error', 'Driver phone number must be exactly 10 digits');
      return;
    }
    if (busForm.capacity <= 0) {
      addToast('Validation Failed', 'error', 'Seating capacity must be greater than zero');
      return;
    }

    // Uniqueness
    const isDuplicateNum = buses.some(b => 
      b.busNumber.toLowerCase() === busForm.busNumber.toLowerCase() && 
      (!editingBus || b.id !== editingBus.id)
    );
    if (isDuplicateNum) {
      addToast('Duplicate Found', 'error', `Bus number ${busForm.busNumber} already exists`);
      return;
    }

    const isDuplicateReg = buses.some(b => 
      b.registrationNumber.toLowerCase() === busForm.registrationNumber.toLowerCase() && 
      (!editingBus || b.id !== editingBus.id)
    );
    if (isDuplicateReg) {
      addToast('Duplicate Found', 'error', `Vehicle registration ${busForm.registrationNumber} already exists`);
      return;
    }

    const formattedPhone = `+91 ${cleanPhone}`;

    if (editingBus) {
      const res = await updateBus(editingBus.id, {
        busNumber: busForm.busNumber,
        registrationNumber: busForm.registrationNumber,
        capacity: busForm.capacity,
        driverName: busForm.driverName,
        driverPhone: formattedPhone,
        startingLocation: busForm.startingLocation,
        startingTime: busForm.startingTime,
        destination: busForm.destination,
        status: busForm.status,
      });
      if (res && (res as any).error) return; // Stay open on failure

      // also update route references if needed
      const routeUsingBus = routes.find(r => r.assignedBusId === editingBus.id);
      if (routeUsingBus) {
        await updateRoute(routeUsingBus.id, {
          assignedDriverName: busForm.driverName,
          assignedDriverPhone: formattedPhone
        });
      }
    } else {
      const res = await addBus({
        busNumber: busForm.busNumber,
        registrationNumber: busForm.registrationNumber,
        capacity: busForm.capacity,
        driverName: busForm.driverName,
        driverPhone: formattedPhone,
        routeId: '',
        status: busForm.status,
        startingLocation: busForm.startingLocation,
        startingTime: busForm.startingTime,
        destination: busForm.destination,
      });
      if (res && (res as any).error) return; // Stay open on failure
    }

    setShowBusModal(false);
  };

  // Delete Bus Safeguard
  const handleDeleteBus = (id: string, busNumber: string) => {
    const assignedStudents = students.filter(s => s.busId === id);
    if (assignedStudents.length > 0) {
      addToast('Action Protected', 'error', `Cannot delete ${busNumber}. ${assignedStudents.length} students are currently assigned to this bus.`);
      return;
    }

    setDeletingBusId(id);
    setDeletingBusNumber(busNumber);
  };

  const confirmDeleteBus = () => {
    if (deletingBusId) {
      deleteBus(deletingBusId);
      setDeletingBusId(null);
      setDeletingBusNumber('');
    }
  };

  // Open Route Modal
  const handleOpenRouteModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setRouteForm({
        name: route.name,
        description: route.description,
        assignedBusId: route.assignedBusId,
      });
      // Load existing stops
      const routeStopsFiltered = stops
        .filter(s => s.routeId === route.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(s => ({
          id: s.id,
          stopName: s.stopName,
          pickupTime: s.pickupTime,
          feePerStop: s.feePerStop,
        }));
      setRouteStops(routeStopsFiltered.length > 0 ? routeStopsFiltered : [{ stopName: '', pickupTime: '07:00 AM', feePerStop: 500 }]);
    } else {
      setEditingRoute(null);
      setRouteForm({
        name: '',
        description: '',
        assignedBusId: '',
      });
      setRouteStops([{ stopName: '', pickupTime: '07:00 AM', feePerStop: 500 }]);
    }
    setShowRouteModal(true);
  };

  // Save Route
  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();

    if (!routeForm.name.trim()) {
      addToast('Validation Failed', 'error', 'Route name is required');
      return;
    }

    // Unique route name
    const isDuplicateRoute = routes.some(r => 
      r.name.toLowerCase() === routeForm.name.toLowerCase() && 
      (!editingRoute || r.id !== editingRoute.id)
    );
    if (isDuplicateRoute) {
      addToast('Duplicate Found', 'error', `Route "${routeForm.name}" already exists`);
      return;
    }

    // Validate stops
    const validStops = routeStops.filter(s => s.stopName.trim() !== '');
    if (validStops.length === 0) {
      addToast('Validation Failed', 'error', 'At least one stop with a valid name is required');
      return;
    }

    // Check duplicate stop names
    const stopNames = validStops.map(s => s.stopName.toLowerCase().trim());
    const uniqueNames = new Set(stopNames);
    if (uniqueNames.size !== stopNames.length) {
      addToast('Validation Failed', 'error', 'Stops within the same route must have unique names');
      return;
    }

    // Check chronological order
    let isChronological = true;
    for (let i = 0; i < validStops.length - 1; i++) {
      const time1 = parseTimeToMinutes(validStops[i].pickupTime);
      const time2 = parseTimeToMinutes(validStops[i + 1].pickupTime);
      if (time1 >= time2) {
        isChronological = false;
        break;
      }
    }
    if (!isChronological) {
      addToast('Chronological Order Mismatch', 'warning', 'Please ensure stop pickup times are in progressive chronological order (e.g., 07:00 AM, then 07:15 AM)');
      return;
    }

    // Find driver and bus info
    const assignedBus = buses.find(b => b.id === routeForm.assignedBusId);
    const assignedDriverName = assignedBus ? assignedBus.driverName : 'No Driver Assigned';
    const assignedDriverPhone = assignedBus ? assignedBus.driverPhone : '';

    if (editingRoute) {
      // 1. Update the Route details
      updateRoute(editingRoute.id, {
        name: routeForm.name,
        description: routeForm.description,
        assignedBusId: routeForm.assignedBusId,
        assignedDriverName,
        assignedDriverPhone,
      });

      // 2. Clear old stops of this route and add new ones
      const oldStops = stops.filter(s => s.routeId === editingRoute.id);
      oldStops.forEach(s => deleteStop(s.id));

      validStops.forEach((s, idx) => {
        addStop({
          routeId: editingRoute.id,
          stopName: s.stopName,
          pickupTime: s.pickupTime,
          dropTime: '03:45 PM',
          feePerStop: Number(s.feePerStop) || 0,
          order: idx + 1,
        });
      });

      // Update bus reference
      if (assignedBus) {
        updateBus(assignedBus.id, { routeId: editingRoute.id });
      }

      addToast('Route Updated Successfully', 'success', `Successfully saved stops and assignments for ${routeForm.name}`);
    } else {
      // 1. Create a brand new route
      const res = addRoute({
        name: routeForm.name,
        description: routeForm.description,
        assignedBusId: routeForm.assignedBusId,
        assignedDriverName,
        assignedDriverPhone,
      });

      if (res && res.success && res.route) {
        const newRouteId = res.route.id;
        
        // 2. Create the stops
        validStops.forEach((s, idx) => {
          addStop({
            routeId: newRouteId,
            stopName: s.stopName,
            pickupTime: s.pickupTime,
            dropTime: '03:45 PM',
            feePerStop: Number(s.feePerStop) || 0,
            order: idx + 1,
          });
        });

        // Update bus reference
        if (assignedBus) {
          updateBus(assignedBus.id, { routeId: newRouteId });
        }
      }
    }

    setShowRouteModal(false);
  };

  // Delete Route Safeguard
  const handleDeleteRoute = (id: string, name: string) => {
    const assignedStudents = students.filter(s => s.routeId === id);
    if (assignedStudents.length > 0) {
      addToast('Action Protected', 'error', `Cannot delete ${name}. ${assignedStudents.length} students are currently registered on this route.`);
      return;
    }

    setDeletingRouteId(id);
    setDeletingRouteName(name);
  };

  const confirmDeleteRoute = () => {
    if (deletingRouteId) {
      // clear associated stops
      const oldStops = stops.filter(s => s.routeId === deletingRouteId);
      oldStops.forEach(s => deleteStop(s.id));

      deleteRoute(deletingRouteId);
      setDeletingRouteId(null);
      setDeletingRouteName('');
    }
  };

  // Local helper to append an empty stop in the modal subform
  const handleAddStopRow = () => {
    // Propose 15 mins after the last stop's time
    let proposedTime = '07:00 AM';
    if (routeStops.length > 0) {
      const lastTime = routeStops[routeStops.length - 1].pickupTime;
      const mins = parseTimeToMinutes(lastTime);
      const newMins = mins + 15;
      const hrs = Math.floor(newMins / 60) % 12 || 12;
      const ampm = newMins >= 720 ? 'PM' : 'AM';
      const mStr = String(newMins % 60).padStart(2, '0');
      proposedTime = `${String(hrs).padStart(2, '0')}:${mStr} ${ampm}`;
    }

    setRouteStops([...routeStops, { stopName: '', pickupTime: proposedTime, feePerStop: 500 }]);
  };

  // Edit fields in local stop row
  const handleUpdateStopRow = (idx: number, field: keyof TempStop, val: any) => {
    const updated = [...routeStops];
    updated[idx] = { ...updated[idx], [field]: val };
    setRouteStops(updated);
  };

  // Delete stop from local row
  const handleDeleteStopRow = (idx: number) => {
    const updated = routeStops.filter((_, i) => i !== idx);
    setRouteStops(updated.length > 0 ? updated : [{ stopName: '', pickupTime: '07:00 AM', feePerStop: 500 }]);
  };

  // Move stop Up / Down
  const handleMoveStopRow = (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === routeStops.length - 1) return;

    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    const updated = [...routeStops];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setRouteStops(updated);
  };

  // Only allow Active buses for Route assignment dropdown
  const activeBuses = useMemo(() => {
    return buses.filter(b => b.status === 'active' || (editingRoute && b.id === editingRoute.assignedBusId));
  }, [buses, editingRoute]);

  // Selected bus in Route form
  const selectedBusDetails = useMemo(() => {
    return buses.find(b => b.id === routeForm.assignedBusId);
  }, [buses, routeForm.assignedBusId]);

  // Destination and arrival visualizer for the last stop
  const proposedSchoolCampusArrival = useMemo(() => {
    const valid = routeStops.filter(s => s.stopName.trim() !== '');
    if (valid.length === 0) return '08:00 AM';
    const lastTime = valid[valid.length - 1].pickupTime;
    const mins = parseTimeToMinutes(lastTime);
    const arrivalMins = mins + 15;
    const hrs = Math.floor(arrivalMins / 60) % 12 || 12;
    const ampm = arrivalMins >= 720 ? 'PM' : 'AM';
    const mStr = String(arrivalMins % 60).padStart(2, '0');
    return `${String(hrs).padStart(2, '0')}:${mStr} ${ampm}`;
  }, [routeStops]);

  // Filter lists based on Search
  const filteredBuses = useMemo(() => {
    return buses.filter(b => 
      b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.startingLocation && b.startingLocation.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [buses, searchQuery]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [routes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BusIcon className="w-5 h-5 text-indigo-500 animate-bounce" />
            Bus & Route Master Planner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage live vehicles, bus lines, fee matrices, and stop arrival schedules</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/30">
          <button 
            onClick={() => { setActiveTab('buses'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'buses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}`}
          >
            Buses ({buses.length})
          </button>
          <button 
            onClick={() => { setActiveTab('routes'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'routes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}`}
          >
            Routes ({routes.length})
          </button>
          <button 
            onClick={() => { setActiveTab('stops'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'stops' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}`}
          >
            Route Stops ({stops.length})
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {activeTab === 'buses' && (
          <button 
            onClick={() => handleOpenBusModal()}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Bus
          </button>
        )}

        {activeTab === 'routes' && (
          <button 
            onClick={() => handleOpenRouteModal()}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Route
          </button>
        )}
      </div>

      {/* TAB 1: BUSES GRID */}
      {activeTab === 'buses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => {
            const stuCount = students.filter(s => s.busId === bus.id).length;
            const assignedRoute = routes.find(r => r.assignedBusId === bus.id);

            return (
              <div 
                key={bus.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Header status strip */}
                <div className={`h-1.5 w-full ${bus.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">{bus.busNumber}</h3>
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md ${bus.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {bus.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{bus.registrationNumber}</p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/40">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {stuCount}/{bus.capacity} Seats
                      </span>
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800/60 py-3 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span className="font-semibold">Starting Location:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{bus.startingLocation || 'Kundrathur'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span className="font-semibold">Starting Time:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{bus.startingTime || '06:30 AM'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span className="font-semibold">Destination:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{bus.destination || 'School Campus'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span className="font-semibold">Driver Details:</span>
                      <span className="text-slate-800 dark:text-slate-200 text-right">
                        <p className="font-bold">{bus.driverName}</p>
                        <p className="text-[10px] text-indigo-500 font-mono mt-0.5">{bus.driverPhone}</p>
                      </span>
                    </div>
                  </div>

                  {assignedRoute ? (
                    <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/30 dark:border-indigo-900/30 flex items-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-semibold">Assigned: {assignedRoute.name}</span>
                    </div>
                  ) : (
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100/30 dark:border-amber-900/30 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="font-semibold">Unassigned / Available</span>
                    </div>
                  )}
                </div>

                {/* Footer action bar */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button 
                    onClick={() => handleOpenBusModal(bus)}
                    className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                    title="Edit Bus"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                    title="Delete Bus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredBuses.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No buses found matching your search.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROUTES LIST WITH EXPANDABLE SCHEDULES */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          {filteredRoutes.map((route) => {
            const assignedBus = buses.find(b => b.id === route.assignedBusId);
            const routeStopsFiltered = stops
              .filter(s => s.routeId === route.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            const isExpanded = expandedRouteId === route.id;
            const routeStudents = students.filter(s => s.routeId === route.id).length;

            return (
              <div 
                key={route.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Main route summary ribbon */}
                <div 
                  className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none ${isExpanded ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                  onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">{route.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] uppercase font-mono font-bold rounded-md text-slate-500">
                        {routeStopsFiltered.length + 1} Stops
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl">{route.description || 'No description provided for this transport route corridor.'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Bus / Driver chip */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/30 rounded-2xl flex items-center gap-3 text-xs">
                      <BusIcon className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{assignedBus ? assignedBus.busNumber : 'No Bus Assigned'}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{assignedBus?.driverName || 'No Driver'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/30 rounded-2xl flex items-center gap-2 text-xs">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{routeStudents} Students</span>
                    </div>

                    {/* Expand arrow */}
                    <button className="p-2 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Stop Scheduler details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/60 p-6 space-y-6 bg-slate-50/40 dark:bg-slate-900/20">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Stop Corridor Sequence & Fee Structure</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenRouteModal(route); }}
                          className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Route
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id, route.name); }}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-xs font-bold text-rose-600 rounded-xl border border-rose-200/40 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Route
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* First stop info */}
                      {assignedBus && (
                        <div className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Start</span>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">Departs: {assignedBus.startingLocation}</h5>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">Starting Time: {assignedBus.startingTime}</p>
                            <p className="text-[10px] text-indigo-500 font-bold mt-1 font-mono uppercase">OUTBOUND DEPARTURE</p>
                          </div>
                        </div>
                      )}

                      {routeStopsFiltered.map((stop, sIdx) => (
                        <div 
                          key={stop.id}
                          className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">{sIdx + 1}</span>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{stop.stopName}</h5>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Pickup: {stop.pickupTime}
                            </p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
                              Term Fee: ₹{stop.feePerStop}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Final School campus destination stop */}
                      <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">End</span>
                        <div>
                          <h5 className="font-extrabold text-xs text-emerald-800 dark:text-emerald-400">School Campus</h5>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">Estimated Arrival: {proposedSchoolCampusArrival}</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 uppercase">DESTINATION ARRIVAL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredRoutes.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No routes found matching your search.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STOPS MATRIX / INTERACTIVE LIST */}
      {activeTab === 'stops' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Global Bus Stops Matrix</h3>
            <p className="text-xs text-slate-400 mt-1">Review all registered stops, arrival intervals, and transport fee schedules across corridors</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Stop Name</th>
                  <th className="px-6 py-4">Assigned Route</th>
                  <th className="px-6 py-4">Pickup Time</th>
                  <th className="px-6 py-4">Outbound Dropoff</th>
                  <th className="px-6 py-4">Term stop Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {stops.map(stop => {
                  const parentRoute = routes.find(r => r.id === stop.routeId);
                  return (
                    <tr key={stop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{stop.stopName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {parentRoute ? parentRoute.name : 'Unknown Route'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{stop.pickupTime}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{stop.dropTime || '03:45 PM'}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">₹{stop.feePerStop}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BUS CREATION / EDITING MODAL */}
      {showBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border relative border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setShowBusModal(false)} 
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <BusIcon className="w-5 h-5 text-indigo-500" />
              {editingBus ? 'Edit Bus Registry' : 'Add New Bus'}
            </h3>

            <form onSubmit={handleSaveBus} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Bus Number</label>
                  <input
                    type="text"
                    required
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. BUS-105"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reg Number</label>
                  <input
                    type="text"
                    required
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. TN-20-AB-1234"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={busForm.driverName}
                    onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                    placeholder="Driver full name"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Driver Phone</label>
                  <div className="flex bg-slate-50 dark:bg-slate-800/80 border rounded-xl overflow-hidden items-center focus-within:ring-2 focus-within:ring-indigo-500">
                    <span className="px-3 text-slate-400 font-mono text-xs select-none border-r border-slate-200 dark:border-slate-700">+91</span>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={busForm.driverPhone.replace(/\D/g, '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setBusForm({ ...busForm, driverPhone: val });
                      }}
                      placeholder="Enter 10 digits"
                      className="w-full px-3 py-2 bg-transparent text-xs font-mono font-medium focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Starting Location</label>
                  <input
                    type="text"
                    required
                    value={busForm.startingLocation}
                    onChange={(e) => setBusForm({ ...busForm, startingLocation: e.target.value })}
                    placeholder="Kundrathur"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Start Time</label>
                  <input
                    type="text"
                    required
                    value={busForm.startingTime}
                    onChange={(e) => setBusForm({ ...busForm, startingTime: e.target.value })}
                    placeholder="06:30 AM"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                  <select
                    value={busForm.status}
                    onChange={(e) => setBusForm({ ...busForm, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Destination (Default)</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={busForm.destination}
                  className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 border rounded-xl text-xs font-bold cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowBusModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROUTE CREATION / EDITING FULL MODAL */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border relative border-slate-200 dark:border-slate-800 my-8">
            <button 
              onClick={() => setShowRouteModal(false)} 
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b pb-4">
              <MapPin className="w-5 h-5 text-indigo-500" />
              {editingRoute ? `Edit Route Corridor: ${routeForm.name}` : 'Create Bus Route Corridor'}
            </h3>

            <form onSubmit={handleSaveRoute} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Route metadata */}
                <div className="md:col-span-1 space-y-4 border-r border-slate-100 dark:border-slate-800/60 pr-0 md:pr-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Route Configuration</h4>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Route Name</label>
                    <input
                      type="text"
                      required
                      value={routeForm.name}
                      onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                      placeholder="e.g. South Corridor (Route C)"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={routeForm.description}
                      onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                      placeholder="Covers Porur, Guindy and surrounding hubs..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Assign active Bus</label>
                    <select
                      value={routeForm.assignedBusId}
                      onChange={(e) => setRouteForm({ ...routeForm, assignedBusId: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Select Active Bus --</option>
                      {activeBuses.map(b => (
                        <option key={b.id} value={b.id}>{b.busNumber} ({b.driverName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Inherited read-only bus stats */}
                  {selectedBusDetails && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/40 space-y-2.5 text-xs">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Inherited Bus Coordinates
                      </h5>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Departing:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedBusDetails.startingLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Launch Time:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedBusDetails.startingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">End Campus:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">School Campus</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel: Stops & Scheduler */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Corridor Stops Sequence</h4>
                    <button
                      type="button"
                      onClick={handleAddStopRow}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold rounded-xl border border-indigo-200/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stop
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                          <th className="px-4 py-3 w-10">#</th>
                          <th className="px-4 py-3">Stop Name</th>
                          <th className="px-4 py-3 w-32">Pickup Time</th>
                          <th className="px-4 py-3 w-28">Stop Fee (₹)</th>
                          <th className="px-4 py-3 w-28 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {/* Outbound starting station visual row */}
                        {selectedBusDetails && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/10 text-slate-400">
                            <td className="px-4 py-2 text-center font-bold">Start</td>
                            <td className="px-4 py-2 font-bold">{selectedBusDetails.startingLocation}</td>
                            <td className="px-4 py-2 font-semibold">{selectedBusDetails.startingTime}</td>
                            <td className="px-4 py-2">-</td>
                            <td className="px-4 py-2 text-center text-[10px] uppercase font-bold tracking-wider">Origin Departs</td>
                          </tr>
                        )}

                        {routeStops.map((stop, idx) => (
                          <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/40">
                            <td className="px-4 py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                required
                                value={stop.stopName}
                                onChange={(e) => handleUpdateStopRow(idx, 'stopName', e.target.value)}
                                placeholder="Stop Name"
                                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                required
                                value={stop.pickupTime}
                                onChange={(e) => handleUpdateStopRow(idx, 'pickupTime', e.target.value)}
                                placeholder="07:00 AM"
                                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 text-center focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                required
                                min={0}
                                value={stop.feePerStop}
                                onChange={(e) => handleUpdateStopRow(idx, 'feePerStop', Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-extrabold text-emerald-600 dark:text-emerald-400 focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 flex justify-center items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveStopRow(idx, 'up')}
                                className="p-1.5 bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-100 disabled:opacity-40"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === routeStops.length - 1}
                                onClick={() => handleMoveStopRow(idx, 'down')}
                                className="p-1.5 bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-100 disabled:opacity-40"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStopRow(idx)}
                                className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-transparent hover:border-rose-200/40 rounded-lg"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* End campus destination visual row */}
                        <tr className="bg-emerald-50/10 text-emerald-600">
                          <td className="px-4 py-2 text-center font-bold">End</td>
                          <td className="px-4 py-2 font-bold">School Campus</td>
                          <td className="px-4 py-2 font-semibold text-center">{proposedSchoolCampusArrival}</td>
                          <td className="px-4 py-2">₹0</td>
                          <td className="px-4 py-2 text-center text-[10px] uppercase font-bold tracking-wider">Campus Arrival</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowRouteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingRoute ? 'Save Route Changes' : 'Create Route Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Bus Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingBusId)}
        title="Delete Fleet Bus?"
        message={`Are you sure you want to permanently delete Bus ${deletingBusNumber}? This action cannot be undone.`}
        confirmText="Yes, Delete Bus"
        type="danger"
        onConfirm={confirmDeleteBus}
        onCancel={() => {
          setDeletingBusId(null);
          setDeletingBusNumber('');
        }}
      />

      {/* Delete Route Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingRouteId)}
        title="Delete Route Corridor?"
        message={`Are you sure you want to permanently delete Route "${deletingRouteName}"? All stops on this route will also be deleted.`}
        confirmText="Yes, Delete Route"
        type="danger"
        onConfirm={confirmDeleteRoute}
        onCancel={() => {
          setDeletingRouteId(null);
          setDeletingRouteName('');
        }}
      />

    </div>
  );
};
