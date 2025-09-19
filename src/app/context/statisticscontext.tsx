"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS, STATE_PROPS, USER_METRICS } from '../types';
import { Timestamp } from 'firebase/firestore';

interface StatisticsContextType {
  statistics: STATISTICS_PROPS | null;
  loading: boolean;
  error: string | null;
  calculateStatistics: (tickets: TICKETS_PROPS[], users: USER_PROPS[]) => STATISTICS_PROPS;
  updateStatisticsFromData: (tickets: TICKETS_PROPS[], users: USER_PROPS[]) => void;
  calculateUserMetrics: (userId: string, tickets: TICKETS_PROPS[], users: USER_PROPS[]) => USER_METRICS | null;
  getAllUserMetrics: (tickets: TICKETS_PROPS[], users: USER_PROPS[]) => USER_METRICS[];
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

interface StatisticsProviderProps {
  children: ReactNode;
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({ children }) => {
  const [statistics, setStatistics] = useState<STATISTICS_PROPS | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función helper reutilizable para convertir timestamp a Date de forma segura
  const safeToDate = useCallback((timestamp: any): Date => {
    if (!timestamp) return new Date(0); // Fecha muy antigua si no existe
    
    // Si ya es un objeto Date
    if (timestamp instanceof Date) return timestamp;
    
    // Si es un Timestamp de Firestore
    if (timestamp && typeof timestamp.toDate === 'function') {
      try {
        return timestamp.toDate();
      } catch (error) {
        console.warn('Error converting timestamp:', error);
        return new Date(0);
      }
    }
    
    // Si es un número (milliseconds)
    if (typeof timestamp === 'number') return new Date(timestamp);
    
    // Si es un string
    if (typeof timestamp === 'string') return new Date(timestamp);
    
    // Si tiene la propiedad seconds (formato Firestore)
    if (timestamp && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    
    console.warn('Unknown timestamp format:', timestamp);
    return new Date(0);
  }, []);

  // Función para calcular estadísticas basadas en datos de tickets y usuarios
  const calculateStatistics = useCallback((tickets: TICKETS_PROPS[], users: USER_PROPS[]): STATISTICS_PROPS => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filtrar tickets válidos (que tengan fecha)
    const validTickets = tickets.filter(ticket => ticket && ticket.date);

    // Cálculos básicos
    const totalTickets = validTickets.length;
    const totalUsers = users ? users.length : 0;

    // Tickets por estado
    const ticketsByState = {
      received: validTickets.filter(t => t.state === STATE_PROPS["Recibido"]).length,
      inProcess: validTickets.filter(t => t.state === STATE_PROPS["En proceso"]).length,
      ready: validTickets.filter(t => t.state === STATE_PROPS["Listo"]).length,
      delivered: validTickets.filter(t => t.state === STATE_PROPS["Entregado"]).length,
    };

    // Tickets por período
    const ticketsToday = validTickets.filter(t => {
      const ticketDate = safeToDate(t.date);
      return ticketDate >= todayStart;
    }).length;

    const ticketsThisWeek = validTickets.filter(t => {
      const ticketDate = safeToDate(t.date);
      return ticketDate >= weekStart;
    }).length;

    const ticketsThisMonth = validTickets.filter(t => {
      const ticketDate = safeToDate(t.date);
      return ticketDate >= monthStart;
    }).length;

    // Tiempo promedio de procesamiento (estimado)
    const completedTickets = validTickets.filter(t => t.state === STATE_PROPS["Entregado"]);
    const averageProcessingTime = completedTickets.length > 0 
      ? completedTickets.reduce((acc, ticket) => {
          const startDate = safeToDate(ticket.date);
          const endDate = ticket.updatedAt ? safeToDate(ticket.updatedAt) : new Date();
          const processTime = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
          return acc + Math.max(0, processTime); // Asegurar que no sea negativo
        }, 0) / completedTickets.length
      : 0;

    // Items más procesados
    const topItems: { [key: string]: number } = {};
    validTickets.forEach(ticket => {
      if (ticket.items && typeof ticket.items === 'object') {
        Object.entries(ticket.items).forEach(([item, quantity]) => {
          if (typeof quantity === 'number') {
            topItems[item] = (topItems[item] || 0) + quantity;
          }
        });
      }
    });

    // Usuarios por empresa
    const usersByCompany: { [company: string]: number } = {};
    if (users && Array.isArray(users)) {
      users.forEach(user => {
        if (user && user.originCompany) {
          usersByCompany[user.originCompany] = (usersByCompany[user.originCompany] || 0) + 1;
        }
      });
    }

    // Métricas de rendimiento
    const completionRate = totalTickets > 0 
      ? (ticketsByState.delivered / totalTickets) * 100 
      : 0;

    const pendingTickets = ticketsByState.received + ticketsByState.inProcess + ticketsByState.ready;

    return {
      totalTickets,
      totalUsers,
      ticketsByState,
      ticketsToday,
      ticketsThisWeek,
      ticketsThisMonth,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      topItems,
      usersByCompany,
      completionRate: Math.round(completionRate * 100) / 100,
      pendingTickets,
      lastUpdated: Timestamp.now()
    };
  }, [safeToDate]);

  // Función pública para actualizar estadísticas con datos externos
  const updateStatisticsFromData = useCallback((tickets: TICKETS_PROPS[], users: USER_PROPS[]) => {
    try {
      // Validar que los datos existen y son arrays
      const validTickets = Array.isArray(tickets) ? tickets : [];
      const validUsers = Array.isArray(users) ? users : [];
      
      const calculatedStats = calculateStatistics(validTickets, validUsers);
      setStatistics(calculatedStats);
      setError(null);
    } catch (err) {
      setError('Error al calcular estadísticas');
      console.error('Error calculating statistics:', err);
    }
  }, [calculateStatistics]);

  // Función para calcular métricas de un usuario específico
  const calculateUserMetrics = useCallback((userId: string, tickets: TICKETS_PROPS[], users: USER_PROPS[]): USER_METRICS | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const userTickets = tickets.filter(t => t.uid === userId);
    if (userTickets.length === 0) return null;

    // Cálculos básicos
    const totalTickets = userTickets.length;

    // Items totales y favoritos
    const allItems: { [item: string]: number } = {};
    let totalItems = 0;
    
    userTickets.forEach(ticket => {
      if (ticket.items) {
        Object.entries(ticket.items).forEach(([item, quantity]) => {
          allItems[item] = (allItems[item] || 0) + quantity;
          totalItems += quantity;
        });
      }
    });

    const averageItemsPerTicket = totalItems / totalTickets;

    // Fechas
    const ticketDates = userTickets.map(t => safeToDate(t.date)).sort((a, b) => a.getTime() - b.getTime());
    const firstVisit = ticketDates[0];
    const lastVisit = ticketDates[ticketDates.length - 1];

    // Frecuencia (tickets por mes)
    const monthsDiff = Math.max(1, (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const frequency = totalTickets / monthsDiff;

    // Estados de tickets
    const ticketsByState = {
      received: userTickets.filter(t => t.state === STATE_PROPS["Recibido"]).length,
      inProcess: userTickets.filter(t => t.state === STATE_PROPS["En proceso"]).length,
      ready: userTickets.filter(t => t.state === STATE_PROPS["Listo"]).length,
      delivered: userTickets.filter(t => t.state === STATE_PROPS["Entregado"]).length,
    };

    // Tiempo promedio de procesamiento
    const completedTickets = userTickets.filter(t => t.state === STATE_PROPS["Entregado"]);
    const averageProcessingTime = completedTickets.length > 0
      ? completedTickets.reduce((acc, ticket) => {
          const startDate = safeToDate(ticket.date);
          const endDate = ticket.updatedAt ? safeToDate(ticket.updatedAt) : new Date();
          const processTime = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
          return acc + Math.max(0, processTime);
        }, 0) / completedTickets.length
      : 0;

    // Score de lealtad (basado en frecuencia y cantidad de tickets)
    const loyaltyScore = Math.min(100, (frequency * 20 + totalTickets * 2));

    return {
      userId: user.id || '',
      userName: `${user.name} ${user.lastname}`,
      userDni: user.dni,
      company: user.originCompany,
      totalTickets,
      totalItems,
      averageItemsPerTicket: Math.round(averageItemsPerTicket * 100) / 100,
      lastVisit,
      firstVisit,
      frequency: Math.round(frequency * 100) / 100,
      favoriteItems: allItems,
      ticketsByState,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      loyaltyScore: Math.round(loyaltyScore * 100) / 100,
      itemsLaundry: allItems
    };
  }, []);

  // Función para obtener métricas de todos los usuarios
  const getAllUserMetrics = useCallback((tickets: TICKETS_PROPS[], users: USER_PROPS[]): USER_METRICS[] => {
    const userMetrics: USER_METRICS[] = [];
    
    users.forEach(user => {
      if (user.id) {
        const metrics = calculateUserMetrics(user.id, tickets, users);
        if (metrics) {
          userMetrics.push(metrics);
        }
      }
    });

    return userMetrics;
  }, [calculateUserMetrics, safeToDate]);

  const value: StatisticsContextType = {
    statistics,
    loading,
    error,
    calculateStatistics,
    updateStatisticsFromData,
    calculateUserMetrics,
    getAllUserMetrics
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};

export const useStatisticsContext = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatisticsContext must be used within a StatisticsProvider');
  }
  return context;
};