import React, { useState, useMemo } from "react";
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS, USER_METRICS } from "../../../types";
import StatisticsExport from "./minicomponents/ReportGenerator";

// ============================
// COMPONENTES DE CARGA Y ERROR
// ============================

interface LoadingSpinnerProps {
    loading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading }) => (
    <section className="md-card rounded flex-1 flex w-full h-full p-5 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--md-primary)" }}></div>
            <p className="text-gray-600">
                {loading ? 'Cargando estadísticas...' : 'Cargando datos de la aplicación...'}
            </p>
        </div>
    </section>
);

interface ErrorMessageProps {
    error: string;
    onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => (
    <section className="md-card rounded flex-1 flex w-full h-full p-5 items-center justify-center">
        <div className="text-center">
            <p className="mb-4" style={{ color: "#ef4444" }}>{error}</p>
            <button 
                onClick={onRetry}
                className="md-btn md-btn-filled"
            >
                Reintentar
            </button>
        </div>
    </section>
);

// ============================
// COMPONENTES DE HEADER Y NAVEGACIÓN
// ============================

interface StatisticsHeaderProps {
    statistics: STATISTICS_PROPS;
}

export const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({ 
    statistics
}) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-light text-gray-800">Panel de Estadísticas Ejecutivo</h1>
                <p className="text-sm text-gray-600">
                    Última actualización: {statistics.lastUpdated.toDate().toLocaleString()}
                </p>
            </div>
        </div>
    );
};

interface TabNavigationProps {
    activeView: 'overview' | 'users';
    onViewChange: (view: 'overview' | 'users') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeView, onViewChange }) => (
    <div className="flex gap-2 mb-6 border-b pb-5 border-gray-200">
        {[
            { key: 'overview', label: 'Resumen' },
            { key: 'users', label: 'Usuarios' }
        ].map(tab => (
            <button
                key={tab.key}
                onClick={() => onViewChange(tab.key as any)}
                className={` p-2 text-sm rounded border ${
                    activeView === tab.key 
                        ? 'border-blue-500 text-blue-600' 
                        : ''
                }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

// ============================
// COMPONENTE DE TABLA DE RESUMEN
// ============================

interface OverviewTableProps {
    statistics: STATISTICS_PROPS;
    selectedPeriod: 'today' | 'week' | 'month' | 'year';
    onPeriodChange: (period: 'today' | 'week' | 'month' | 'year') => void;
}

export const OverviewTable: React.FC<OverviewTableProps> = ({ 
    statistics, 
    selectedPeriod, 
    onPeriodChange 
}) => {
    const periodOptions = [
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Esta Semana' },
        { value: 'month', label: 'Este Mes' },
        { value: 'year', label: 'Este Año' }
    ];
    // Función para obtener métricas según el período seleccionado
    const getPeriodMetrics = useMemo(() => {
        switch (selectedPeriod) {
            case 'today':
                return {
                    title: 'Métricas de Hoy',
                    tickets: statistics.ticketsToday,
                    description: 'Actividad del día actual'
                };
            case 'week':
                return {
                    title: 'Métricas de Esta Semana',
                    tickets: statistics.ticketsThisWeek,
                    description: 'Actividad de los últimos 7 días'
                };
            case 'month':
                return {
                    title: 'Métricas de Este Mes',
                    tickets: statistics.ticketsThisMonth,
                    description: 'Actividad del mes actual'
                };
            case 'year':
                return {
                    title: 'Métricas del Año',
                    tickets: statistics.totalTickets,
                    description: 'Actividad del año actual'
                };
            default:
                return {
                    title: 'Métricas de Este Mes',
                    tickets: statistics.ticketsThisMonth,
                    description: 'Actividad del mes actual'
                };
        }
    }, [statistics, selectedPeriod]);

    return (
        <div className=" overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: "var(--md-surface)", borderBottom: "1px solid var(--md-outline)" }}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: "var(--md-on-surface)" }}>Resumen General</h3>
                        <div className="text-sm mt-1">
                            <span style={{ color: "var(--md-on-surface)", opacity: 0.8 }}>Mostrando: </span>
                            <span className="font-medium" style={{ color: "var(--md-primary)" }}>
                                {getPeriodMetrics.title}
                            </span>
                            <div className="text-xs mt-1" style={{ color: "var(--md-on-surface)", opacity: 0.7 }}>{getPeriodMetrics.description}</div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 items-center">
                        {/* Selector de período */}
                        <div className="flex gap-x-3">
                            {periodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onPeriodChange(option.value as any)}
                                    className={`rounded p-2 ${
                                        selectedPeriod === option.value
                                            ? ' bg-blue-100 font-semibold'
                                            : ' bg-gray-100'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8" style={{ backgroundColor: "var(--md-outline)" }}></div>

                        <StatisticsExport
                            data={{
                                statistics,
                                reportType: 'general',
                                title: 'Panel de Estadísticas Ejecutivo'
                            }}
                            options={{
                                filename: 'estadisticas_lavanderia',
                                includeTimestamp: true
                            }}
                        >
                            {({ exportToCSV, exportToPDF }) => (
                                <>
                                    <button onClick={exportToCSV} className=" p-2 rounded bg-blue-50 text-sm font-semibold hover:bg-blue-200 transition-all ease-in">CSV</button>
                                    <button onClick={exportToPDF} className=" p-2 rounded bg-blue-50 text-sm font-semibold hover:bg-blue-200 transition-all ease-in">PDF</button>
                                </>
                            )}
                        </StatisticsExport>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                            <thead style={{ backgroundColor: "var(--md-surface)", color: "var(--md-on-surface)" }}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métrica</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ backgroundColor: "var(--md-surface-container)", borderColor: "var(--md-outline)", color: "var(--md-on-surface)" }}>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {selectedPeriod === 'today' ? 'Tickets Hoy' : 
                                 selectedPeriod === 'week' ? 'Tickets Esta Semana' :
                                 selectedPeriod === 'month' ? 'Tickets Este Mes' : 'Tickets Este Año'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                {getPeriodMetrics.tickets}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    getPeriodMetrics.tickets >= (selectedPeriod === 'today' ? 5 : selectedPeriod === 'week' ? 20 : 50) 
                                        ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {getPeriodMetrics.tickets >= (selectedPeriod === 'today' ? 5 : selectedPeriod === 'week' ? 20 : 50) 
                                        ? 'Bueno' : 'Regular'}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total de Usuarios</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{statistics.totalUsers}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Registrados
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tasa de Completación</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{statistics.completionRate}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    statistics.completionRate >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {statistics.completionRate >= 80 ? 'Excelente' : 'Regular'}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tiempo Promedio (hrs)</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{statistics.averageProcessingTime}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    statistics.averageProcessingTime <= 24 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {statistics.averageProcessingTime <= 24 ? 'Eficiente' : 'Mejorable'}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tickets Pendientes</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{statistics.pendingTickets}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    statistics.pendingTickets <= 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {statistics.pendingTickets <= 5 ? 'Controlado' : 'Atención'}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Sección de estados de tickets */}
            <div className="px-6 py-4" style={{ backgroundColor: "var(--md-surface)", borderTop: "1px solid var(--md-outline)" }}>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribución por Estados</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{statistics.ticketsByState.received}</div>
                        <div className="text-xs text-gray-600">Recibidos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{statistics.ticketsByState.inProcess}</div>
                        <div className="text-xs text-gray-600">En Proceso</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{statistics.ticketsByState.ready}</div>
                        <div className="text-xs text-gray-600">Listos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{statistics.ticketsByState.delivered}</div>
                        <div className="text-xs text-gray-600">Entregados</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================
// COMPONENTES DE USUARIOS
// ============================

interface UsersViewProps {
    tickets: TICKETS_PROPS[];
    users: USER_PROPS[];
    getAllUserMetrics: (tickets: TICKETS_PROPS[], users: USER_PROPS[]) => USER_METRICS[];
}

export const UsersView: React.FC<UsersViewProps> = ({ tickets, users, getAllUserMetrics }) => {
    const [dniSearch, setDniSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<USER_METRICS | null>(null);
    
    // Obtener métricas de usuarios
    const userMetrics = useMemo(() => {
        return getAllUserMetrics(tickets, users);
    }, [tickets, users, getAllUserMetrics]);
    
    // Filtrar usuarios por DNI
    const searchResults = useMemo(() => {
        if (!dniSearch.trim()) {
            return userMetrics.slice(0, 10); // Mostrar solo los primeros 10 por defecto
        }
        
        const searchDni = dniSearch.trim();
        return userMetrics.filter(user => 
            user.userDni.toString() === searchDni
        );
    }, [userMetrics, dniSearch]);

    // Si hay un usuario seleccionado, mostrar los detalles
    if (selectedUser) {
        return (
            <UserDetailView 
                selectedUser={selectedUser} 
                onBack={() => setSelectedUser(null)} 
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Buscador */}
            <div className="md-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Buscar Usuario
                </h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            DNI del Usuario
                        </label>
                        <input
                            type="text"
                            value={dniSearch}
                            onChange={(e) => setDniSearch(e.target.value)}
                            placeholder="Ej: 41727987"
                            className="w-full px-3 py-2 rounded border focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setDniSearch('')}
                        className="text-sm hover:text-blue-400"
                    >
                        Limpiar
                    </button>
                </div>
                
                {/* Indicador de resultados */}
                <div className="mt-3">
                    {dniSearch && searchResults.length === 0 ? (
                        <p className="text-sm text-red-600">No se encontró usuario con DNI: {dniSearch}</p>
                    ) : dniSearch && searchResults.length > 0 ? (
                        <p className="text-sm text-green-600">Usuario encontrado</p>
                    ) : (
                        <p className="text-sm text-gray-500">Ingrese el DNI completo para buscar un usuario específico o vea los primeros 10 usuarios</p>
                    )}
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="md-card">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {dniSearch ? 'Resultado de Búsqueda' : 'Usuarios Activos'}
                        </h3>
                        <span className="text-sm text-gray-500">
                            {searchResults.length} usuario{searchResults.length !== 1 ? 's' : ''}
                            {!dniSearch && userMetrics.length > 10 && ' (mostrando 10 de ' + userMetrics.length + ')'}
                        </span>
                    </div>
                </div>

                {searchResults.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tickets</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Última Visita</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Prendas Lavadas</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {searchResults.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                                                <div className="text-sm text-gray-500">DNI: {user.userDni}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.company}</td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user.totalTickets}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                                            {user.lastVisit.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.totalItems >= 50 ? 'bg-green-100 text-green-800' :
                                                user.totalItems >= 25 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.totalItems}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="md-btn md-btn-outlined"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 text-4xl mb-4">Sin datos</div>
                        <p className="text-gray-600">No hay usuarios para mostrar</p>
                        <p className="text-sm text-gray-500 mt-1">Intente con un DNI diferente</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================
// VISTA DE DETALLES DE USUARIO
// ============================


interface UserDetailViewProps {
    selectedUser: USER_METRICS;
    onBack: () => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({ selectedUser, onBack }) => {
    return (
        <div className="md-card md-elevated overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="md-btn md-btn-outlined"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Usuarios
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Detalles de Usuario
                    </h3>
                    <StatisticsExport
                        data={{
                            singleUser: selectedUser,
                            reportType: 'single-user',
                            title: `Reporte de ${selectedUser.userName}`
                        }}
                        options={{
                            filename: `usuario_${selectedUser.userDni}`,
                            includeTimestamp: true
                        }}
                    >
                        {({ exportToCSV, exportToPDF }) => (
                            <div className="flex gap-2">
                                <button onClick={exportToCSV} className="md-btn md-btn-outlined">CSV</button>
                                <button onClick={exportToPDF} className="md-btn md-btn-filled">PDF</button>
                            </div>
                        )}
                    </StatisticsExport>
                </div>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información básica */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Información Personal
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Nombre:</span> {selectedUser.userName}</div>
                            <div><span className="font-medium">DNI:</span> {selectedUser.userDni}</div>
                            <div><span className="font-medium">Empresa:</span> {selectedUser.company}</div>
                            <div><span className="font-medium">Primera visita:</span> {selectedUser.firstVisit.toLocaleDateString()}</div>
                            <div><span className="font-medium">Última visita:</span> {selectedUser.lastVisit.toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Métricas de actividad */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Métricas de Actividad
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Total tickets:</span> {selectedUser.totalTickets}</div>
                            <div><span className="font-medium">Total prendas lavadas:</span> <span className="text-blue-600 font-semibold">{selectedUser.totalItems}</span></div>
                            <div><span className="font-medium">Prendas por ticket:</span> {selectedUser.averageItemsPerTicket}</div>
                            <div><span className="font-medium">Frecuencia de visitas:</span> {selectedUser.frequency} días</div>
                        </div>
                    </div>

                    {/* Estados de tickets */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Estados de Tickets
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Recibidos:</span>
                                <span className="font-medium">{selectedUser.ticketsByState.received}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>En proceso:</span>
                                <span className="font-medium">{selectedUser.ticketsByState.inProcess}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Listos:</span>
                                <span className="font-medium">{selectedUser.ticketsByState.ready}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Entregados:</span>
                                <span className="font-medium">{selectedUser.ticketsByState.delivered}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tiempo de procesamiento */}
                    <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Tiempo de Procesamiento
                        </h4>
                        <div className="text-sm">
                            <div className="flex justify-between">
                                <span>Promedio:</span>
                                <span className="font-medium">{selectedUser.averageProcessingTime} horas</span>
                            </div>
                            <div className="mt-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    selectedUser.averageProcessingTime <= 24 ? 'bg-green-100 text-green-800' :
                                    selectedUser.averageProcessingTime <= 48 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {selectedUser.averageProcessingTime <= 24 ? 'Rápido' :
                                     selectedUser.averageProcessingTime <= 48 ? 'Normal' : 'Lento'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desglose detallado de prendas lavadas */}
                {selectedUser.favoriteItems && Object.keys(selectedUser.favoriteItems).length > 0 && (
                    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Desglose de Prendas Lavadas
                        </h4>
                        <div className="space-y-3">
                            <div className="text-sm text-gray-600 mb-4">
                                Total de prendas procesadas: <span className="font-semibold text-blue-600">{selectedUser.totalItems}</span>
                            </div>
                            
                            {/* Lista detallada con cantidades */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                {Object.entries(selectedUser.favoriteItems)
                                    .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                                    .map(([itemName, quantity], index) => (
                                    <div key={index} className="bg-white px-4 py-2 rounded-lg border border-yellow-200 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                            <span className="text-sm font-medium text-gray-700">{itemName}</span>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                            {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Resumen estadístico */}
                            <div className="mt-4 pt-3 border-t border-yellow-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Tipos diferentes de prendas:</span>
                                    <span className="font-semibold text-gray-700">{Object.keys(selectedUser.favoriteItems).length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <span className="text-gray-600">Prenda más frecuente:</span>
                                    <span className="font-semibold text-gray-700">
                                        {Object.entries(selectedUser.favoriteItems).length > 0 
                                            ? Object.entries(selectedUser.favoriteItems)
                                                .sort(([,a], [,b]) => b - a)[0][0]
                                            : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
