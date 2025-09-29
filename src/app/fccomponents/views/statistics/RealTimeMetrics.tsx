import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  Bell,
  Zap
} from "lucide-react";
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS } from "../../../types";

interface RealTimeMetricsProps {
  statistics: STATISTICS_PROPS;
  tickets: TICKETS_PROPS[];
  users: USER_PROPS[];
}

interface AlertProps {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

const AlertCard: React.FC<AlertProps> = ({ type, title, message, timestamp, priority }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getAlertStyles()}`}>
      <div className="flex items-start gap-3">
        {getPriorityIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{title}</h4>
            <span className="text-xs opacity-75">
              {timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm mt-1 opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ 
  statistics, 
  tickets, 
  users 
}) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Generar alertas basadas en métricas
  const generateAlerts = useMemo(() => {
    const newAlerts: AlertProps[] = [];

    // Alerta por tickets pendientes altos
    if (statistics.pendingTickets > 10) {
      newAlerts.push({
        id: 'pending-high',
        type: 'warning',
        title: 'Muchos Tickets Pendientes',
        message: `Tienes ${statistics.pendingTickets} tickets pendientes. Considera aumentar el personal.`,
        timestamp: new Date(),
        priority: 'high'
      });
    }

    // Alerta por tiempo de procesamiento lento
    if (statistics.averageProcessingTime > 48) {
      newAlerts.push({
        id: 'processing-slow',
        type: 'error',
        title: 'Procesamiento Lento',
        message: `El tiempo promedio de procesamiento es de ${statistics.averageProcessingTime} horas.`,
        timestamp: new Date(),
        priority: 'high'
      });
    }

    // Alerta por baja tasa de completación
    if (statistics.completionRate < 70) {
      newAlerts.push({
        id: 'completion-low',
        type: 'warning',
        title: 'Baja Tasa de Completación',
        message: `La tasa de completación es del ${statistics.completionRate}%. Revisa los procesos.`,
        timestamp: new Date(),
        priority: 'medium'
      });
    }

    // Alerta de éxito por buen rendimiento
    if (statistics.completionRate >= 90 && statistics.averageProcessingTime <= 24) {
      newAlerts.push({
        id: 'performance-excellent',
        type: 'success',
        title: 'Excelente Rendimiento',
        message: 'El sistema está funcionando de manera óptima. ¡Buen trabajo!',
        timestamp: new Date(),
        priority: 'low'
      });
    }

    return newAlerts;
  }, [statistics]);

  // Actualizar alertas cuando cambien las métricas
  useEffect(() => {
    setAlerts(prevAlerts => {
      const newAlerts = generateAlerts.filter(alert => 
        !prevAlerts.some(existing => existing.id === alert.id)
      );
      return [...prevAlerts, ...newAlerts].slice(-10); // Mantener solo las últimas 10
    });
  }, [generateAlerts]);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setIsOnline(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Métricas en tiempo real
  const realTimeData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const ticketsToday = tickets.filter(t => {
      if (!t.date) return false;
      const ticketDate = new Date(t.date.toDate());
      return ticketDate >= todayStart;
    }).length;

    const ticketsLastHour = tickets.filter(t => {
      if (!t.date) return false;
      const ticketDate = new Date(t.date.toDate());
      return ticketDate >= lastHour;
    }).length;

    const activeUsers = users.filter(u => {
      const userTickets = tickets.filter(t => t.uid === u.id);
      return userTickets.some(t => {
        if (!t.date) return false;
        const ticketDate = new Date(t.date.toDate());
        return ticketDate >= todayStart;
      });
    }).length;

    return {
      ticketsToday,
      ticketsLastHour,
      activeUsers,
      totalUsers: users.length,
      onlineStatus: isOnline
    };
  }, [tickets, users, isOnline]);

  return (
    <div className="space-y-6">
      {/* Header con estado de conexión */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <h2 className="text-xl font-semibold text-gray-900">Métricas en Tiempo Real</h2>
            <span className="text-sm text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>Actualización automática cada 5s</span>
          </div>
        </div>
      </div>

      {/* Métricas principales en tiempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{realTimeData.ticketsToday}</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{realTimeData.ticketsLastHour} última hora
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900">{realTimeData.activeUsers}</p>
              <p className="text-sm text-gray-500">
                de {realTimeData.totalUsers} total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Completación</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.completionRate}%</p>
              <p className="text-sm text-gray-500">
                {statistics.completionRate >= 80 ? 'Excelente' : 'Mejorable'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.averageProcessingTime}h</p>
              <p className="text-sm text-gray-500">
                {statistics.averageProcessingTime <= 24 ? 'Rápido' : 'Lento'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h3>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <AlertCard key={alert.id} {...alert} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No hay alertas activas</p>
                <p className="text-sm">El sistema está funcionando correctamente</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Base de Datos</span>
              </div>
              <span className="text-sm text-green-600">Conectada</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">API de Tickets</span>
              </div>
              <span className="text-sm text-green-600">Operativa</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Sistema de Notificaciones</span>
              </div>
              <span className="text-sm text-green-600">Activo</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Sincronización</span>
              </div>
              <span className="text-sm text-yellow-600">En proceso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de actividad reciente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {tickets.filter(t => t.date).slice(0, 5).map((ticket, index) => {
            const user = users.find(u => u.id === ticket.uid);
            const ticketDate = new Date(ticket.date.toDate());
            
            return (
              <div key={ticket.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Ticket #{ticket.id?.slice(-6)} - {user?.name} {user?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ticketDate.toLocaleString()} - Estado: {ticket.state === 1 ? 'Recibido' : 
                    ticket.state === 2 ? 'En Proceso' : ticket.state === 3 ? 'Listo' : 'Entregado'}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {ticketDate.toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
