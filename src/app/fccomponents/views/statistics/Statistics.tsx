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
    const [activeView, setActiveView] = useState<'overview' | 'users'>('overview');
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
            <StatisticsHeader 
                statistics={statistics}
            />

            {/* Navegación por pestañas */}
            <TabNavigation 
                activeView={activeView}
                onViewChange={setActiveView}
            />

            {/* Contenido de las vistas */}
            <div className="space-y-6">
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