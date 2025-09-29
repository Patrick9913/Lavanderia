import React, { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users, 
  Package,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3
} from "lucide-react";
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS } from "../../../types";

interface ExecutiveSummaryProps {
  statistics: STATISTICS_PROPS;
  tickets: TICKETS_PROPS[];
  users: USER_PROPS[];
}

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color,
  subtitle,
  trend = 'stable'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ 
  statistics, 
  tickets, 
  users 
}) => {
  // Calcular métricas avanzadas
  const advancedMetrics = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tickets de la semana pasada
    const lastWeekTickets = tickets.filter(t => {
      if (!t.date) return false;
      const ticketDate = new Date(t.date.toDate());
      return ticketDate >= lastWeek && ticketDate < now;
    }).length;

    // Tickets del mes pasado
    const lastMonthTickets = tickets.filter(t => {
      if (!t.date) return false;
      const ticketDate = new Date(t.date.toDate());
      return ticketDate >= lastMonth && ticketDate < now;
    }).length;

    // Calcular tendencias (simulado para demo)
    const weeklyGrowth = lastWeekTickets > 0 ? ((statistics.ticketsThisWeek - lastWeekTickets) / lastWeekTickets) * 100 : 0;
    const monthlyGrowth = lastMonthTickets > 0 ? ((statistics.ticketsThisMonth - lastMonthTickets) / lastMonthTickets) * 100 : 0;

    // Eficiencia operativa
    const operationalEfficiency = statistics.completionRate;
    const processingEfficiency = statistics.averageProcessingTime <= 24 ? 95 : 
                                 statistics.averageProcessingTime <= 48 ? 75 : 50;

    // Satisfacción del cliente (simulado)
    const customerSatisfaction = Math.min(100, Math.max(60, 
      (statistics.completionRate * 0.7) + (processingEfficiency * 0.3)
    ));

    // Productividad del personal
    const staffProductivity = statistics.totalTickets > 0 ? 
      (statistics.ticketsThisWeek / statistics.totalUsers) * 10 : 0;

    return {
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      operationalEfficiency: Math.round(operationalEfficiency * 10) / 10,
      processingEfficiency: Math.round(processingEfficiency * 10) / 10,
      customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
      staffProductivity: Math.round(staffProductivity * 10) / 10
    };
  }, [statistics, tickets]);

  // Generar insights automáticos
  const insights = useMemo(() => {
    const insights = [];

    if (statistics.completionRate >= 90) {
      insights.push({
        type: 'success',
        title: 'Excelente Rendimiento',
        message: 'La tasa de completación supera el 90%, indicando un proceso muy eficiente.',
        icon: CheckCircle
      });
    }

    if (statistics.averageProcessingTime <= 24) {
      insights.push({
        type: 'success',
        title: 'Procesamiento Rápido',
        message: 'El tiempo promedio de procesamiento es menor a 24 horas.',
        icon: Clock
      });
    }

    if (statistics.pendingTickets > 10) {
      insights.push({
        type: 'warning',
        title: 'Cola de Trabajo Alta',
        message: `Hay ${statistics.pendingTickets} tickets pendientes. Considera aumentar el personal.`,
        icon: AlertTriangle
      });
    }

    if (advancedMetrics.weeklyGrowth > 20) {
      insights.push({
        type: 'info',
        title: 'Crecimiento Sostenido',
        message: `Los tickets han crecido un ${advancedMetrics.weeklyGrowth}% esta semana.`,
        icon: TrendingUp
      });
    }

    if (advancedMetrics.customerSatisfaction < 70) {
      insights.push({
        type: 'warning',
        title: 'Satisfacción del Cliente',
        message: 'La satisfacción del cliente está por debajo del 70%. Revisa los procesos.',
        icon: AlertTriangle
      });
    }

    return insights;
  }, [statistics, advancedMetrics]);

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Tickets Totales"
          value={statistics.totalTickets}
          change={advancedMetrics.weeklyGrowth}
          changeType={advancedMetrics.weeklyGrowth > 0 ? 'positive' : 'negative'}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          subtitle={`${statistics.ticketsToday} hoy`}
          trend={advancedMetrics.weeklyGrowth > 0 ? 'up' : 'down'}
        />
        
        <KPICard
          title="Eficiencia Operativa"
          value={`${advancedMetrics.operationalEfficiency}%`}
          change={2.5}
          changeType="positive"
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-green-500"
          subtitle="Tasa de completación"
          trend="up"
        />
        
        <KPICard
          title="Satisfacción del Cliente"
          value={`${advancedMetrics.customerSatisfaction}%`}
          change={1.2}
          changeType="positive"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          subtitle="Nivel de satisfacción"
          trend="up"
        />
        
        <KPICard
          title="Productividad del Personal"
          value={`${advancedMetrics.staffProductivity}`}
          change={5.8}
          changeType="positive"
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          subtitle="Tickets por usuario/semana"
          trend="up"
        />
      </div>

      {/* Resumen ejecutivo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Resumen Ejecutivo</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Métricas Clave</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tickets procesados este mes:</span>
                <span className="font-semibold text-gray-900">{statistics.ticketsThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo promedio de procesamiento:</span>
                <span className="font-semibold text-gray-900">{statistics.averageProcessingTime} horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usuarios activos:</span>
                <span className="font-semibold text-gray-900">{statistics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tickets pendientes:</span>
                <span className="font-semibold text-gray-900">{statistics.pendingTickets}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Estado del Sistema</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  statistics.completionRate >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-700">
                  {statistics.completionRate >= 80 ? 'Sistema funcionando óptimamente' : 'Sistema requiere atención'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  statistics.averageProcessingTime <= 24 ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-700">
                  {statistics.averageProcessingTime <= 24 ? 'Procesamiento eficiente' : 'Procesamiento lento'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  statistics.pendingTickets <= 5 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-700">
                  {statistics.pendingTickets <= 5 ? 'Cola de trabajo controlada' : 'Cola de trabajo alta'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights y recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights Automáticos</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const getInsightColor = () => {
                switch (insight.type) {
                  case 'success': return 'text-green-600 bg-green-50 border-green-200';
                  case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                  case 'error': return 'text-red-600 bg-red-50 border-red-200';
                  default: return 'text-blue-600 bg-blue-50 border-blue-200';
                }
              };

              return (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor()}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                      <p className="text-sm opacity-90">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
          <div className="space-y-4">
            {statistics.completionRate < 80 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Mejorar Eficiencia</h4>
                <p className="text-sm text-yellow-700">
                  La tasa de completación está por debajo del 80%. Considera optimizar los procesos de trabajo.
                </p>
              </div>
            )}
            
            {statistics.averageProcessingTime > 48 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Reducir Tiempo de Procesamiento</h4>
                <p className="text-sm text-red-700">
                  El tiempo promedio de procesamiento es alto. Revisa la asignación de personal y procesos.
                </p>
              </div>
            )}
            
            {statistics.pendingTickets > 15 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Aumentar Capacidad</h4>
                <p className="text-sm text-orange-700">
                  Hay muchos tickets pendientes. Considera contratar personal adicional o mejorar la eficiencia.
                </p>
              </div>
            )}
            
            {statistics.completionRate >= 90 && statistics.averageProcessingTime <= 24 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Mantener Excelencia</h4>
                <p className="text-sm text-green-700">
                  El sistema está funcionando de manera excelente. Mantén los procesos actuales.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
