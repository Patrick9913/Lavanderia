import React, { useEffect, useState } from "react";
import { useStatisticsContext } from "../../../context/statisticscontext";
import { useAppContext } from "../../../context/appcontext";
import { USER_METRICS } from "../../../types";
import { 
    LoadingSpinner, 
    ErrorMessage, 
    StatisticsHeader, 
    TabNavigation, 
    OverviewTable, 
    UsersView
} from "./StatisticsComponents";
import { AdvancedDashboard } from "./AdvancedDashboard";
import { RealTimeMetrics } from "./RealTimeMetrics";
import { PredictiveAnalytics } from "./PredictiveAnalytics";
import { ExecutiveSummary } from "./ExecutiveSummary";
import ExportManager from "./ExportManager";

export const Statistics: React.FC = () => {
    const { 
        statistics, 
        loading, 
        error, 
        updateStatisticsFromData, 
        getAllUserMetrics
    } = useStatisticsContext();
    const { tickets, users } = useAppContext();
    
    // Estados locales del componente principal
    const [activeView, setActiveView] = useState<'overview' | 'users' | 'dashboard' | 'realtime' | 'predictive' | 'executive'>('executive');
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

    // Actualizar estadísticas cuando cambien los datos
    useEffect(() => {
        if (tickets !== null && users !== null) {
            updateStatisticsFromData(tickets, users);
        }
    }, [tickets, users, updateStatisticsFromData]);

    // Estados de carga y error
    if (loading || tickets === null || users === null) {
        return <LoadingSpinner loading={loading} />;
    }

    if (error) {
        return (
            <ErrorMessage 
                error={error} 
                onRetry={() => tickets && users && updateStatisticsFromData(tickets, users)} 
            />
        );
    }

    if (!statistics) {
        return (
            <section className="bg-white rounded flex-1 flex w-full h-full p-5 items-center justify-center">
                <p className="text-gray-600">No hay datos disponibles</p>
            </section>
        );
    }

    return (
        <section className="bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-auto">
            {/* Header con controles */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-light text-gray-800">Panel de Estadísticas Ejecutivo</h1>
                    <p className="text-sm text-gray-600">
                        Última actualización: {statistics.lastUpdated.toDate().toLocaleString()}
                    </p>
                </div>
                <ExportManager 
                    statistics={statistics}
                    tickets={tickets}
                    users={users}
                    userMetrics={getAllUserMetrics(tickets, users)}
                />
            </div>

            {/* Navegación por pestañas */}
            <div className="flex gap-2 mb-6 border-b pb-5 border-gray-200">
                {[
                    { key: 'executive', label: 'Resumen Ejecutivo', icon: '👑' },
                    { key: 'dashboard', label: 'Dashboard Avanzado', icon: '📊' },
                    { key: 'realtime', label: 'Tiempo Real', icon: '⚡' },
                    { key: 'predictive', label: 'Análisis Predictivo', icon: '🔮' },
                    { key: 'overview', label: 'Resumen', icon: '📋' },
                    { key: 'users', label: 'Usuarios', icon: '👥' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveView(tab.key as any)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                            activeView === tab.key 
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido de las vistas */}
            <div className="space-y-6">
                {activeView === 'executive' && (
                    <ExecutiveSummary 
                        statistics={statistics}
                        tickets={tickets}
                        users={users}
                    />
                )}
                {activeView === 'dashboard' && (
                    <AdvancedDashboard 
                        statistics={statistics}
                        tickets={tickets}
                        users={users}
                        getAllUserMetrics={getAllUserMetrics}
                    />
                )}
                {activeView === 'realtime' && (
                    <RealTimeMetrics 
                        statistics={statistics}
                        tickets={tickets}
                        users={users}
                    />
                )}
                {activeView === 'predictive' && (
                    <PredictiveAnalytics 
                        statistics={statistics}
                        tickets={tickets}
                        users={users}
                    />
                )}
                {activeView === 'overview' && (
                    <OverviewTable 
                        statistics={statistics}
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />
                )}
                {activeView === 'users' && (
                    <UsersView 
                        tickets={tickets}
                        users={users}
                        getAllUserMetrics={getAllUserMetrics}
                    />
                )}
            </div>
        </section>
    );
};