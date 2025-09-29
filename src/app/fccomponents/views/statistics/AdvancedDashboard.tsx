import React, { useState, useMemo, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Building,
  Activity,
  Target,
  Zap
} from "lucide-react";
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS, USER_METRICS } from "../../../types";

interface AdvancedDashboardProps {
  statistics: STATISTICS_PROPS;
  tickets: TICKETS_PROPS[];
  users: USER_PROPS[];
  getAllUserMetrics: (tickets: TICKETS_PROPS[], users: USER_PROPS[]) => USER_METRICS[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color,
  subtitle 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ 
  statistics, 
  tickets, 
  users, 
  getAllUserMetrics 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Datos para gráficos
  const chartData = useMemo(() => {
    const now = new Date();
    const periods = {
      today: { days: 1, label: 'Hoy' },
      week: { days: 7, label: 'Última semana' },
      month: { days: 30, label: 'Último mes' },
      year: { days: 365, label: 'Último año' }
    };

    const period = periods[selectedPeriod];
    const data = [];

    for (let i = period.days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayTickets = tickets.filter(ticket => {
        if (!ticket.date) return false;
        const ticketDate = new Date(ticket.date.toDate());
        return ticketDate.toDateString() === date.toDateString();
      });

      data.push({
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        tickets: dayTickets.length,
        completed: dayTickets.filter(t => t.state === 4).length,
        inProcess: dayTickets.filter(t => t.state === 2).length,
        received: dayTickets.filter(t => t.state === 1).length
      });
    }

    return data;
  }, [tickets, selectedPeriod]);

  // Datos para gráfico de estados
  const stateData = useMemo(() => {
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];
    return [
      { name: 'Recibidos', value: statistics.ticketsByState.received, color: colors[0] },
      { name: 'En Proceso', value: statistics.ticketsByState.inProcess, color: colors[1] },
      { name: 'Listos', value: statistics.ticketsByState.ready, color: colors[2] },
      { name: 'Entregados', value: statistics.ticketsByState.delivered, color: colors[3] }
    ];
  }, [statistics.ticketsByState]);

  // Datos para gráfico de empresas
  const companyData = useMemo(() => {
    const companyStats = Object.entries(statistics.usersByCompany)
      .map(([company, count]) => ({ name: company, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return companyStats;
  }, [statistics.usersByCompany]);

  // Datos para gráfico de prendas más populares
  const topItemsData = useMemo(() => {
    return Object.entries(statistics.topItems)
      .map(([item, count]) => ({ name: item, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [statistics.topItems]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalTickets = statistics.totalTickets;
    const completionRate = statistics.completionRate;
    const avgProcessingTime = statistics.averageProcessingTime;
    const pendingTickets = statistics.pendingTickets;

    // Calcular tendencias (simulado para demo)
    const trends = {
      tickets: Math.random() * 20 - 10, // -10% a +10%
      completion: Math.random() * 15 - 5, // -5% a +10%
      processing: Math.random() * 20 - 10, // -10% a +10%
      users: Math.random() * 25 - 5 // -5% a +20%
    };

    return {
      totalTickets: { value: totalTickets, trend: trends.tickets },
      completionRate: { value: `${completionRate}%`, trend: trends.completion },
      avgProcessingTime: { value: `${avgProcessingTime}h`, trend: -trends.processing },
      pendingTickets: { value: pendingTickets, trend: -trends.tickets },
      totalUsers: { value: statistics.totalUsers, trend: trends.users }
    };
  }, [statistics]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Aquí se podría recargar los datos
      console.log('Auto-refreshing dashboard...');
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
            <p className="text-gray-600">Métricas en tiempo real de la lavandería</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Selector de período */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            {/* Selector de empresa */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las empresas</option>
                {Object.keys(statistics.usersByCompany).map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-actualizar
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tickets"
          value={metrics.totalTickets.value}
          change={metrics.totalTickets.trend}
          changeType={metrics.totalTickets.trend > 0 ? 'positive' : 'negative'}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          subtitle={`${statistics.ticketsToday} hoy`}
        />
        
        <MetricCard
          title="Tasa de Completación"
          value={metrics.completionRate.value}
          change={metrics.completionRate.trend}
          changeType={metrics.completionRate.trend > 0 ? 'positive' : 'negative'}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-green-500"
          subtitle="Tickets entregados"
        />
        
        <MetricCard
          title="Tiempo Promedio"
          value={metrics.avgProcessingTime.value}
          change={metrics.avgProcessingTime.trend}
          changeType={metrics.avgProcessingTime.trend < 0 ? 'positive' : 'negative'}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          subtitle="Horas de procesamiento"
        />
        
        <MetricCard
          title="Tickets Pendientes"
          value={metrics.pendingTickets.value}
          change={metrics.pendingTickets.trend}
          changeType={metrics.pendingTickets.trend < 0 ? 'positive' : 'negative'}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color="bg-red-500"
          subtitle="Requieren atención"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendencias de tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Tickets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="tickets" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stackId="2" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de distribución por estados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stateData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {stateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stateData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top empresas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Empresas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={companyData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Prendas más populares */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prendas Más Populares</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topItemsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Rendimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statistics.completionRate >= 80 ? '✓' : '⚠'}
            </div>
            <p className="text-sm text-gray-600">Eficiencia General</p>
            <p className="text-lg font-semibold">
              {statistics.completionRate >= 80 ? 'Excelente' : 'Mejorable'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {statistics.averageProcessingTime <= 24 ? '⚡' : '🐌'}
            </div>
            <p className="text-sm text-gray-600">Velocidad de Procesamiento</p>
            <p className="text-lg font-semibold">
              {statistics.averageProcessingTime <= 24 ? 'Rápido' : 'Lento'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {statistics.pendingTickets <= 5 ? '🎯' : '📈'}
            </div>
            <p className="text-sm text-gray-600">Control de Cola</p>
            <p className="text-lg font-semibold">
              {statistics.pendingTickets <= 5 ? 'Controlado' : 'Atención'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
