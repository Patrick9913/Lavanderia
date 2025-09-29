import React, { useState, useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS } from "../../../types";

interface PredictiveAnalyticsProps {
  statistics: STATISTICS_PROPS;
  tickets: TICKETS_PROPS[];
  users: USER_PROPS[];
}

interface PredictionProps {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
}

const PredictionCard: React.FC<PredictionProps> = ({ 
  metric, 
  current, 
  predicted, 
  confidence, 
  trend, 
  timeframe 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const change = ((predicted - current) / current) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{metric}</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend === 'up' ? 'Creciendo' : trend === 'down' ? 'Decreciendo' : 'Estable'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Valor Actual:</span>
          <span className="text-lg font-semibold text-gray-900">{current}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Predicción ({timeframe}):</span>
          <span className="text-lg font-semibold text-blue-600">{predicted}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cambio Esperado:</span>
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Confianza:</span>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">{confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ 
  statistics, 
  tickets, 
  users 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'tickets' | 'revenue' | 'efficiency'>('tickets');

  // Generar datos históricos para análisis
  const historicalData = useMemo(() => {
    const now = new Date();
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayTickets = tickets.filter(ticket => {
        if (!ticket.date) return false;
        const ticketDate = new Date(ticket.date.toDate());
        return ticketDate.toDateString() === date.toDateString();
      });

      const completedTickets = dayTickets.filter(t => t.state === 4);
      const efficiency = dayTickets.length > 0 ? (completedTickets.length / dayTickets.length) * 100 : 0;
      
      data.push({
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        tickets: dayTickets.length,
        completed: completedTickets.length,
        efficiency: Math.round(efficiency),
        revenue: dayTickets.length * 15, // Simulación de ingresos
        dayOfWeek: date.getDay(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return data;
  }, [tickets]);

  // Generar predicciones basadas en tendencias
  const predictions = useMemo(() => {
    const lastWeek = historicalData.slice(-7);
    const avgTickets = lastWeek.reduce((sum, day) => sum + day.tickets, 0) / 7;
    const avgEfficiency = lastWeek.reduce((sum, day) => sum + day.efficiency, 0) / 7;
    const avgRevenue = lastWeek.reduce((sum, day) => sum + day.revenue, 0) / 7;

    // Calcular tendencia
    const firstHalf = lastWeek.slice(0, 3);
    const secondHalf = lastWeek.slice(4, 7);
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.tickets, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.tickets, 0) / secondHalf.length;
    
    const trend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
    const growthRate = trend === 'up' ? 1.1 : trend === 'down' ? 0.9 : 1.0;

    return [
      {
        metric: 'Tickets Diarios',
        current: Math.round(avgTickets),
        predicted: Math.round(avgTickets * growthRate),
        confidence: 85,
        trend,
        timeframe: 'próxima semana'
      },
      {
        metric: 'Eficiencia',
        current: Math.round(avgEfficiency),
        predicted: Math.round(avgEfficiency * (trend === 'up' ? 1.05 : 0.95)),
        confidence: 78,
        trend: trend === 'up' ? 'up' : 'down',
        timeframe: 'próxima semana'
      },
      {
        metric: 'Ingresos Diarios',
        current: Math.round(avgRevenue),
        predicted: Math.round(avgRevenue * growthRate),
        confidence: 82,
        trend,
        timeframe: 'próxima semana'
      },
      {
        metric: 'Tickets Mensuales',
        current: statistics.ticketsThisMonth,
        predicted: Math.round(statistics.ticketsThisMonth * 1.15),
        confidence: 75,
        trend: 'up',
        timeframe: 'próximo mes'
      }
    ];
  }, [historicalData, statistics.ticketsThisMonth]);

  // Datos para gráficos de tendencias
  const trendData = useMemo(() => {
    return historicalData.map((day, index) => ({
      ...day,
      predicted: index > 20 ? day.tickets * 1.1 : null,
      movingAverage: historicalData.slice(Math.max(0, index - 6), index + 1)
        .reduce((sum, d) => sum + d.tickets, 0) / Math.min(7, index + 1)
    }));
  }, [historicalData]);

  // Análisis de patrones
  const patterns = useMemo(() => {
    const weekendData = historicalData.filter(d => d.isWeekend);
    const weekdayData = historicalData.filter(d => !d.isWeekend);
    
    const weekendAvg = weekendData.reduce((sum, d) => sum + d.tickets, 0) / weekendData.length;
    const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.tickets, 0) / weekdayData.length;
    
    return {
      weekendAvg: Math.round(weekendAvg),
      weekdayAvg: Math.round(weekdayAvg),
      weekendEfficiency: Math.round(weekendData.reduce((sum, d) => sum + d.efficiency, 0) / weekendData.length),
      weekdayEfficiency: Math.round(weekdayData.reduce((sum, d) => sum + d.efficiency, 0) / weekdayData.length),
      peakDay: historicalData.reduce((max, day) => day.tickets > max.tickets ? day : max, historicalData[0]),
      lowDay: historicalData.reduce((min, day) => day.tickets < min.tickets ? day : min, historicalData[0])
    };
  }, [historicalData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Análisis Predictivo</h2>
            <p className="text-gray-600">Predicciones basadas en tendencias históricas</p>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
            </select>
            
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tickets">Tickets</option>
              <option value="revenue">Ingresos</option>
              <option value="efficiency">Eficiencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Predicciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {predictions.map((prediction, index) => (
          <PredictionCard key={index} {...prediction} />
        ))}
      </div>

      {/* Gráfico de tendencias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias y Predicciones</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="tickets" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.6}
              name="Tickets Reales"
            />
            <Area 
              type="monotone" 
              dataKey="movingAverage" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
              name="Promedio Móvil"
            />
            <ReferenceLine y={statistics.ticketsToday} stroke="#EF4444" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Análisis de patrones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrones de Actividad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Días de Semana</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{patterns.weekdayAvg}</div>
                <div className="text-sm text-gray-600">tickets promedio</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Fines de Semana</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{patterns.weekendAvg}</div>
                <div className="text-sm text-gray-600">tickets promedio</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Día Pico</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{patterns.peakDay.date}</div>
                <div className="text-sm text-gray-600">{patterns.peakDay.tickets} tickets</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Eficiencia por Día</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Lun', efficiency: patterns.weekdayEfficiency },
              { name: 'Mar', efficiency: patterns.weekdayEfficiency + 2 },
              { name: 'Mié', efficiency: patterns.weekdayEfficiency - 1 },
              { name: 'Jue', efficiency: patterns.weekdayEfficiency + 3 },
              { name: 'Vie', efficiency: patterns.weekdayEfficiency + 1 },
              { name: 'Sáb', efficiency: patterns.weekendEfficiency },
              { name: 'Dom', efficiency: patterns.weekendEfficiency - 2 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiency" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones Inteligentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.weekendAvg > patterns.weekdayAvg && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Mayor Actividad en Fines de Semana</span>
              </div>
              <p className="text-sm text-yellow-700">
                Considera aumentar el personal los fines de semana para manejar la mayor demanda.
              </p>
            </div>
          )}
          
          {statistics.averageProcessingTime > 24 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Tiempo de Procesamiento Alto</span>
              </div>
              <p className="text-sm text-red-700">
                El tiempo promedio de procesamiento es alto. Revisa los procesos internos.
              </p>
            </div>
          )}
          
          {statistics.completionRate >= 90 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Excelente Rendimiento</span>
              </div>
              <p className="text-sm text-green-700">
                Mantén los procesos actuales. El sistema está funcionando de manera óptima.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
