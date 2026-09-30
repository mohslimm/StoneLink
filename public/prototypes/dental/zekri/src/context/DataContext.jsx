import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialServices, initialAppointments, initialMessages } from '../data/mockData';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('clinic_services');
    if (!saved) return initialServices;
    
    // Merge logic: keep user updates but ensure new missing fields (like 'image') are included
    const parsed = JSON.parse(saved);
    const merged = initialServices.map(base => {
      const savedItem = parsed.find(item => item.id === base.id);
      // Prioritize 'base' (mockData.js) so developer edits reflect immediately
      return savedItem ? { ...savedItem, ...base } : base;
    });
    
    // Add any services from localStorage that aren't in the initial list
    const extra = parsed.filter(p => !initialServices.some(i => i.id === p.id));
    return [...merged, ...extra];
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('clinic_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('clinic_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : initialMessages;
    }
    return initialMessages;
  });

  useEffect(() => {
    localStorage.setItem('clinic_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('clinic_messages', JSON.stringify(messages));
  }, [messages]);

  // CRUD for Services
  const addService = (service) => setServices([...services, { ...service, id: Date.now() }]);
  const updateService = (updated) => setServices(services.map(s => s.id === updated.id ? updated : s));
  const deleteService = (id) => setServices(services.filter(s => s.id !== id));

  // CRUD for Appointments
  const addAppointment = (app) => setAppointments([...appointments, { ...app, id: Date.now() }]);
  const deleteAppointment = (id) => setAppointments(appointments.filter(a => a.id !== id));

  // CRUD for Messages
  const addMessage = (msg) => setMessages([{ ...msg, id: Date.now(), date: new Date().toISOString() }, ...messages]);
  const deleteMessage = (id) => setMessages(messages.filter(m => m.id !== id));

  return (
    <DataContext.Provider value={{ 
      services, 
      addService, 
      updateService, 
      deleteService,
      appointments,
      addAppointment,
      deleteAppointment,
      messages,
      addMessage,
      deleteMessage
    }}>
      {children}
    </DataContext.Provider>
  );
};
