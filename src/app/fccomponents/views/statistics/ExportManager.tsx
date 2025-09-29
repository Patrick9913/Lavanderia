import React, { useState } from "react";
import { 
  Download, 
  FileText, 
  BarChart3, 
  Mail, 
  Share2, 
  Settings,
  Calendar,
  Filter,
  Image,
  Table
} from "lucide-react";
import { STATISTICS_PROPS, TICKETS_PROPS, USER_PROPS, USER_METRICS } from "../../../types";

interface ExportManagerProps {
  statistics: STATISTICS_PROPS;
  tickets: TICKETS_PROPS[];
  users: USER_PROPS[];
  userMetrics?: USER_METRICS[];
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'image';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: 'today' | 'week' | 'month' | 'year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeUsers: boolean;
  includeTickets: boolean;
  includeStatistics: boolean;
  chartTypes: ('bar' | 'line' | 'pie' | 'area')[];
  emailTo?: string;
  subject?: string;
  message?: string;
}

const ExportManager: React.FC<ExportManagerProps> = ({ 
  statistics, 
  tickets, 
  users, 
  userMetrics = [] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    dateRange: 'month',
    includeUsers: true,
    includeTickets: true,
    includeStatistics: true,
    chartTypes: ['bar', 'line', 'pie'],
    emailTo: '',
    subject: 'Reporte de Lavandería',
    message: 'Adjunto encontrará el reporte solicitado.'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular progreso de exportación
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsExporting(false);
            setIsOpen(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Aquí iría la lógica real de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setIsExporting(false);
    }
  };

  const generatePreview = () => {
    const previewData = {
      statistics: {
        totalTickets: statistics.totalTickets,
        totalUsers: statistics.totalUsers,
        completionRate: statistics.completionRate,
        averageProcessingTime: statistics.averageProcessingTime
      },
      tickets: exportOptions.includeTickets ? tickets.slice(0, 10) : [],
      users: exportOptions.includeUsers ? users.slice(0, 10) : [],
      userMetrics: userMetrics.slice(0, 5)
    };

    return previewData;
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Documento profesional con gráficos' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Hoja de cálculo con datos' },
    { value: 'csv', label: 'CSV', icon: BarChart3, description: 'Datos separados por comas' },
    { value: 'json', label: 'JSON', icon: Settings, description: 'Datos estructurados' },
    { value: 'image', label: 'Imagen', icon: Image, description: 'Gráficos como imágenes' }
  ];

  const chartTypeOptions = [
    { value: 'bar', label: 'Gráficos de Barras' },
    { value: 'line', label: 'Gráficos de Líneas' },
    { value: 'pie', label: 'Gráficos Circulares' },
    { value: 'area', label: 'Gráficos de Área' }
  ];

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Exportar Datos
      </button>

      {/* Modal de exportación */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Exportar Datos</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Selección de formato */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Formato de Exportación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formatOptions.map((format) => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.value}
                        onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          exportOptions.format === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{format.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{format.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opciones de contenido */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido a Incluir</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeStatistics}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeStatistics: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span>Estadísticas Generales</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeTickets}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeTickets: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span>Datos de Tickets</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeUsers}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeUsers: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span>Datos de Usuarios</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeCharts}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span>Incluir Gráficos</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeRawData}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeRawData: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span>Datos en Bruto</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Rango de fechas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rango de Fechas</h3>
                <div className="flex gap-4">
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                    <option value="year">Este año</option>
                    <option value="custom">Personalizado</option>
                  </select>
                  
                  {exportOptions.dateRange === 'custom' && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={exportOptions.customStartDate || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, customStartDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="date"
                        value={exportOptions.customEndDate || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, customEndDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tipos de gráficos */}
              {exportOptions.includeCharts && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Gráficos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chartTypeOptions.map((chart) => (
                      <label key={chart.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.chartTypes.includes(chart.value as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExportOptions(prev => ({
                                ...prev,
                                chartTypes: [...prev.chartTypes, chart.value as any]
                              }));
                            } else {
                              setExportOptions(prev => ({
                                ...prev,
                                chartTypes: prev.chartTypes.filter(type => type !== chart.value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{chart.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Envío por email */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Envío por Email (Opcional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de destino
                    </label>
                    <input
                      type="email"
                      value={exportOptions.emailTo || ''}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, emailTo: e.target.value }))}
                      placeholder="ejemplo@empresa.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      value={exportOptions.subject || ''}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={exportOptions.message || ''}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 overflow-x-auto">
                    {JSON.stringify(generatePreview(), null, 2)}
                  </pre>
                </div>
              </div>

              {/* Barra de progreso */}
              {isExporting && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Exportando...</span>
                    <span className="text-sm text-gray-500">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isExporting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportManager;
