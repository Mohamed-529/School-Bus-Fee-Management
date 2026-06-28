import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bus, Route, Stop } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  Bus as BusIcon, MapPin, Plus, Edit2, Trash2, Users, 
  ChevronUp, ChevronDown, Clock, DollarSign, X 
} from 'lucide-react';

export const FleetRoutesView: React.FC = () => {
  const { 
    buses, routes, stops, students, 
    addBus, deleteBus, addRoute, deleteRoute, 
    addStop, deleteStop, reorderStops, addToast, settings 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'stops'>('buses');
  
  // Modals state
  const [modalType, setModalType] = useState<'bus' | 'route' | 'stop' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'bus' | 'route' } | null>(null);

  // Form states
  const [busForm, setBusForm] = useState({ busNumber: 'BUS-105', registrationNumber: 'KA-01-EQ-9912', capacity: 40, driverName: '', driverPhone: '+1 (555) ', routeId: routes[0]?.id || '' });
  const [routeForm, setRouteForm] = useState({ name: '', description: 'Covers major city junctions', assignedBusId: buses[0]?.id || '' });
  const [stopForm, setStopForm] = useState({ routeId: routes[0]?.id || '', stopName: '', pickupTime: '07:30 AM', feePerStop: 600 });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'bus') {
      addBus({ ...busForm, status: 'active' });
    } else if (modalType === 'route') {
      const b = buses.find(bus => bus.id === routeForm.assignedBusId);
      addRoute({ ...routeForm, assignedDriverName: b?.driverName });
    } else if (modalType === 'stop') {
      const currentCount = stops.filter(s => s.routeId === stopForm.routeId).length;
      addStop({ ...stopForm, order: currentCount + 1 });
    }
    setModalType(null);
  };

  const handleMoveStop = (stopId: string, routeId: string, direction: 'up' | 'down') => {
    const routeStops = stops.filter(s => s.routeId === routeId).sort((a,b) => a.order - b.order);
    const idx = routeStops.findIndex(s => s.id === stopId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === routeStops.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newArr = [...routeStops];
    const temp = newArr[idx];
    newArr[idx] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    reorderStops(routeId, newArr.map(s => s.id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border inline-flex gap-2 shadow-xs">
        <button
          onClick={() => setActiveTab('buses')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'buses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <BusIcon className="w-4 h-4" /> Bus Management ({buses.length})
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'routes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <MapPin className="w-4 h-4" /> Route Management ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('stops')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'stops' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <MapPin className="w-4 h-4" /> Stop & Sequence Control ({stops.length})
        </button>
      </div>

      {/* 1. BUS MANAGEMENT TAB */}
      {activeTab === 'buses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Transport Fleet</h3>
            <button
              onClick={() => setModalType('bus')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Bus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buses.map((bus) => {
              const assignedCount = students.filter(s => s.busId === bus.id).length;
              const rt = routes.find(r => r.id === bus.routeId);
              return (
                <div key={bus.id} className="bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950 rounded-2xl text-indigo-600 font-bold">
                        <BusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{bus.busNumber}</h4>
                        <p className="font-mono text-xs text-slate-400">{bus.registrationNumber}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Driver Assigned</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{bus.driverName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Driver Contact</span>
                      <span className="font-mono">{bus.driverPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>Capacity: {assignedCount} / {bus.capacity} Students</span>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ id: bus.id, type: 'bus' })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Bus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ROUTE MANAGEMENT TAB */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transit Route Grid</h3>
            <button
              onClick={() => setModalType('route')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Transit Route
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((rt) => {
              const stuCount = students.filter(s => s.routeId === rt.id).length;
              const b = buses.find(bus => bus.id === rt.assignedBusId);
              return (
                <div key={rt.id} className="bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{rt.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{rt.description}</p>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg text-xs">
                      {stuCount} Students
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                    <span className="text-slate-500">Allocated Fleet Bus</span>
                    <span className="font-bold">{b?.busNumber || 'BUS-101'} ({rt.assignedDriverName || 'Rajesh'})</span>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <button
                      onClick={() => setDeleteConfirm({ id: rt.id, type: 'route' })}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Route
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STOP MANAGEMENT TAB */}
      {activeTab === 'stops' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Route Stops & Sequence Reordering</h3>
            <button
              onClick={() => setModalType('stop')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Route Stop
            </button>
          </div>

          <div className="space-y-6">
            {routes.map((rt) => {
              const rtStops = stops.filter(s => s.routeId === rt.id).sort((a,b) => a.order - b.order);
              return (
                <div key={rt.id} className="bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-base text-indigo-600 dark:text-indigo-400 border-b pb-3">{rt.name} Stops Sequence</h4>
                  {rtStops.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specific pickup stops configured inside this route yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {rtStops.map((sp, idx) => (
                        <div key={sp.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{sp.stopName}</span>
                          </div>

                          <div className="flex items-center gap-6">
                            <span className="font-mono flex items-center gap-1 text-slate-500">
                              <Clock className="w-3.5 h-3.5" /> {sp.pickupTime}
                            </span>
                            <span className="font-mono font-bold text-emerald-600">
                              {settings.currency}{sp.feePerStop}/term
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveStop(sp.id, rt.id, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveStop(sp.id, rt.id, 'down')}
                                disabled={idx === rtStops.length - 1}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteStop(sp.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border relative">
            <button onClick={() => setModalType(null)} className="absolute top-6 right-6 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 capitalize">Add {modalType}</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-medium">
              {modalType === 'bus' && (
                <>
                  <div><label className="block mb-1">Bus Number *</label><input type="text" required value={busForm.busNumber} onChange={e => setBusForm({...busForm, busNumber: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
                  <div><label className="block mb-1">Driver Name *</label><input type="text" required value={busForm.driverName} onChange={e => setBusForm({...busForm, driverName: e.target.value})} placeholder="e.g. Anand Kumar" className="w-full p-2.5 border rounded-xl" /></div>
                  <div><label className="block mb-1">Capacity</label><input type="number" value={busForm.capacity} onChange={e => setBusForm({...busForm, capacity: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl font-mono" /></div>
                </>
              )}

              {modalType === 'route' && (
                <>
                  <div><label className="block mb-1">Route Name *</label><input type="text" required value={routeForm.name} onChange={e => setRouteForm({...routeForm, name: e.target.value})} placeholder="e.g. East Suburbs" className="w-full p-2.5 border rounded-xl" /></div>
                  <div><label className="block mb-1">Assign Fleet Bus</label><select value={routeForm.assignedBusId} onChange={e => setRouteForm({...routeForm, assignedBusId: e.target.value})} className="w-full p-2.5 border rounded-xl">{buses.map(b => <option key={b.id} value={b.id}>{b.busNumber}</option>)}</select></div>
                </>
              )}

              {modalType === 'stop' && (
                <>
                  <div><label className="block mb-1">Select Route</label><select value={stopForm.routeId} onChange={e => setStopForm({...stopForm, routeId: e.target.value})} className="w-full p-2.5 border rounded-xl">{routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                  <div><label className="block mb-1">Stop Name *</label><input type="text" required value={stopForm.stopName} onChange={e => setStopForm({...stopForm, stopName: e.target.value})} placeholder="e.g. Gate 3 Plaza" className="w-full p-2.5 border rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block mb-1">Pickup Time</label><input type="text" value={stopForm.pickupTime} onChange={e => setStopForm({...stopForm, pickupTime: e.target.value})} className="w-full p-2.5 border rounded-xl font-mono" /></div>
                    <div><label className="block mb-1">Fee ($)</label><input type="number" value={stopForm.feePerStop} onChange={e => setStopForm({...stopForm, feePerStop: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl font-mono" /></div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md">Confirm Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirm)}
        title={`Delete ${deleteConfirm?.type === 'bus' ? 'Bus' : 'Route'}?`}
        message="Are you sure you want to delete this resource? If students are assigned, deletion will be blocked safely."
        confirmText="Confirm Delete"
        type="danger"
        onConfirm={() => {
          if (deleteConfirm?.type === 'bus') deleteBus(deleteConfirm.id);
          else if (deleteConfirm?.type === 'route') deleteRoute(deleteConfirm.id);
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

    </div>
  );
};
