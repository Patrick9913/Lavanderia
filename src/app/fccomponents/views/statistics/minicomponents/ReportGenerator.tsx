import React from 'react';
import { STATISTICS_PROPS, USER_METRICS } from '../../../../types';

// Tipos para las opciones de exportación
export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  format?: 'csv' | 'pdf';
}

export interface ExportData {
  // Para estadísticas generales
  statistics?: STATISTICS_PROPS;
  // Para métricas de usuarios
  userMetrics?: USER_METRICS[];
  // Para un usuario específico
  singleUser?: USER_METRICS;
  // Tipo de reporte
  reportType: 'general' | 'users' | 'single-user';
  // Título personalizado
  title?: string;
}

interface StatisticsExportProps {
  data: ExportData;
  options?: ExportOptions;
  children: (exportFunctions: {
    exportToCSV: () => void;
    exportToPDF: () => void;
  }) => React.ReactNode;
}

export const StatisticsExport: React.FC<StatisticsExportProps> = ({ 
  data, 
  options = {}, 
  children 
}) => {
  const {
    filename,
    includeTimestamp = true,
    format = 'csv'
  } = options;

  // Función para generar el nombre del archivo
  const generateFilename = (extension: string): string => {
    const baseFilename = filename || `reporte_lavanderia_${data.reportType}`;
    const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    return `${baseFilename}${timestamp}.${extension}`;
  };

  // Función para exportar estadísticas generales a CSV
  const exportGeneralStatsToCSV = (statistics: STATISTICS_PROPS): string => {
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Tickets', statistics.totalTickets.toString()],
      ['Total de Usuarios', statistics.totalUsers.toString()],
      ['Tickets Hoy', statistics.ticketsToday.toString()],
      ['Tickets Esta Semana', statistics.ticketsThisWeek.toString()],
      ['Tickets Este Mes', statistics.ticketsThisMonth.toString()],
      ['Tasa de Completación', `${statistics.completionRate}%`],
      ['Tiempo Promedio de Procesamiento', `${statistics.averageProcessingTime}h`],
      ['Tickets Pendientes', statistics.pendingTickets.toString()],
      [''],
      ['Estados de Tickets', ''],
      ['Recibidos', statistics.ticketsByState.received.toString()],
      ['En Proceso', statistics.ticketsByState.inProcess.toString()],
      ['Listos', statistics.ticketsByState.ready.toString()],
      ['Entregados', statistics.ticketsByState.delivered.toString()],
      [''],
      ['Usuarios por Empresa', ''],
      ...Object.entries(statistics.usersByCompany).map(([company, count]) => [company, count.toString()]),
      [''],
      ['Items Más Procesados', ''],
      ...Object.entries(statistics.topItems).map(([item, count]) => [item, count.toString()])
    ];

    return csvData.map(row => row.join(',')).join('\n');
  };

  // Función para exportar métricas de usuarios a CSV
  const exportUserMetricsToCSV = (userMetrics: USER_METRICS[]): string => {
    const headers = [
      'Usuario', 'DNI', 'Empresa', 'Total Tickets', 'Total Items', 
      'Promedio Items/Ticket', 'Primera Visita', 'Última Visita', 
      'Frecuencia (tickets/mes)', 'Tiempo Promedio Procesamiento', 'Score Lealtad',
      'Tickets Recibidos', 'Tickets En Proceso', 'Tickets Listos', 'Tickets Entregados'
    ];

    const rows = userMetrics.map(user => [
      user.userName,
      user.userDni.toString(),
      user.company,
      user.totalTickets.toString(),
      user.totalItems.toString(),
      user.averageItemsPerTicket.toString(),
      user.firstVisit.toLocaleDateString(),
      user.lastVisit.toLocaleDateString(),
      user.frequency.toString(),
      user.averageProcessingTime.toString(),
      user.loyaltyScore.toString(),
      user.ticketsByState.received.toString(),
      user.ticketsByState.inProcess.toString(),
      user.ticketsByState.ready.toString(),
      user.ticketsByState.delivered.toString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Función para exportar un usuario específico a CSV
  const exportSingleUserToCSV = (user: USER_METRICS): string => {
    const csvData = [
      ['Campo', 'Valor'],
      ['Nombre', user.userName],
      ['DNI', user.userDni.toString()],
      ['Empresa', user.company],
      ['Total Tickets', user.totalTickets.toString()],
      ['Total Items Lavados', user.totalItems.toString()],
      ['Promedio Items por Ticket', user.averageItemsPerTicket.toString()],
      ['Primera Visita', user.firstVisit.toLocaleDateString()],
      ['Última Visita', user.lastVisit.toLocaleDateString()],
      ['Frecuencia (tickets/mes)', user.frequency.toString()],
      ['Tiempo Promedio Procesamiento', `${user.averageProcessingTime}h`],
      ['Score de Lealtad', user.loyaltyScore.toString()],
      [''],
      ['Estados de Tickets', ''],
      ['Recibidos', user.ticketsByState.received.toString()],
      ['En Proceso', user.ticketsByState.inProcess.toString()],
      ['Listos', user.ticketsByState.ready.toString()],
      ['Entregados', user.ticketsByState.delivered.toString()],
      [''],
      ['Items Favoritos', ''],
      ...Object.entries(user.favoriteItems || {}).map(([item, count]) => [item, count.toString()])
    ];

    return csvData.map(row => row.join(',')).join('\n');
  };

  // Función principal para exportar a CSV
  const exportToCSV = () => {
    let csvContent = '';
    
    switch (data.reportType) {
      case 'general':
        if (data.statistics) {
          csvContent = exportGeneralStatsToCSV(data.statistics);
        }
        break;
      case 'users':
        if (data.userMetrics) {
          csvContent = exportUserMetricsToCSV(data.userMetrics);
        }
        break;
      case 'single-user':
        if (data.singleUser) {
          csvContent = exportSingleUserToCSV(data.singleUser);
        }
        break;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', generateFilename('csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Función para generar HTML para PDF de estadísticas generales
  const generateGeneralStatsPDFHTML = (statistics: STATISTICS_PROPS): string => {
    return `
      <html>
        <head>
          <title>Reporte de Estadísticas - Lavandería</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metric { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
            .metric-label { font-weight: bold; }
            .metric-value { color: #0066cc; }
            .section { margin: 20px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title || 'Reporte de Estadísticas - Lavandería'}</h1>
            <p>Generado el: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Métricas Generales</div>
            <div class="metric">
              <span class="metric-label">Total de Tickets:</span> 
              <span class="metric-value">${statistics.totalTickets}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Total de Usuarios:</span> 
              <span class="metric-value">${statistics.totalUsers}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Tickets Hoy:</span> 
              <span class="metric-value">${statistics.ticketsToday}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Tickets Esta Semana:</span> 
              <span class="metric-value">${statistics.ticketsThisWeek}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Tickets Este Mes:</span> 
              <span class="metric-value">${statistics.ticketsThisMonth}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Tasa de Completación:</span> 
              <span class="metric-value">${statistics.completionRate}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Tiempo Promedio de Procesamiento:</span> 
              <span class="metric-value">${statistics.averageProcessingTime}h</span>
            </div>
            <div class="metric">
              <span class="metric-label">Tickets Pendientes:</span> 
              <span class="metric-value">${statistics.pendingTickets}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Estados de Tickets</div>
            <table>
              <tr><th>Estado</th><th>Cantidad</th></tr>
              <tr><td>Recibidos</td><td>${statistics.ticketsByState.received}</td></tr>
              <tr><td>En Proceso</td><td>${statistics.ticketsByState.inProcess}</td></tr>
              <tr><td>Listos</td><td>${statistics.ticketsByState.ready}</td></tr>
              <tr><td>Entregados</td><td>${statistics.ticketsByState.delivered}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Usuarios por Empresa</div>
            <table>
              <tr><th>Empresa</th><th>Usuarios</th></tr>
              ${Object.entries(statistics.usersByCompany).map(([company, count]) => 
                `<tr><td>${company}</td><td>${count}</td></tr>`
              ).join('')}
            </table>
          </div>

          <div class="section">
            <div class="section-title">Items Más Procesados</div>
            <table>
              <tr><th>Item</th><th>Cantidad</th></tr>
              ${Object.entries(statistics.topItems).map(([item, count]) => 
                `<tr><td>${item}</td><td>${count}</td></tr>`
              ).join('')}
            </table>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;
  };

  // Función para generar HTML para PDF de usuario específico
  const generateSingleUserPDFHTML = (user: USER_METRICS): string => {
    return `
      <html>
        <head>
          <title>Reporte de Usuario - ${user.userName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .user-info { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .metric { margin: 8px 0; }
            .metric-label { font-weight: bold; }
            .metric-value { color: #0066cc; }
            .section { margin: 20px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title || `Reporte de Usuario - ${user.userName}`}</h1>
            <p>Generado el: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="user-info">
            <h2>Información Personal</h2>
            <div class="metric">
              <span class="metric-label">Nombre:</span> 
              <span class="metric-value">${user.userName}</span>
            </div>
            <div class="metric">
              <span class="metric-label">DNI:</span> 
              <span class="metric-value">${user.userDni}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Empresa:</span> 
              <span class="metric-value">${user.company}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Primera Visita:</span> 
              <span class="metric-value">${user.firstVisit.toLocaleDateString()}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Última Visita:</span> 
              <span class="metric-value">${user.lastVisit.toLocaleDateString()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Métricas de Actividad</div>
            <table>
              <tr><th>Métrica</th><th>Valor</th></tr>
              <tr><td>Total Tickets</td><td>${user.totalTickets}</td></tr>
              <tr><td>Total Items Lavados</td><td>${user.totalItems}</td></tr>
              <tr><td>Promedio Items por Ticket</td><td>${user.averageItemsPerTicket}</td></tr>
              <tr><td>Frecuencia (tickets/mes)</td><td>${user.frequency}</td></tr>
              <tr><td>Tiempo Promedio Procesamiento</td><td>${user.averageProcessingTime}h</td></tr>
              <tr><td>Score de Lealtad</td><td>${user.loyaltyScore}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Estados de Tickets</div>
            <table>
              <tr><th>Estado</th><th>Cantidad</th></tr>
              <tr><td>Recibidos</td><td>${user.ticketsByState.received}</td></tr>
              <tr><td>En Proceso</td><td>${user.ticketsByState.inProcess}</td></tr>
              <tr><td>Listos</td><td>${user.ticketsByState.ready}</td></tr>
              <tr><td>Entregados</td><td>${user.ticketsByState.delivered}</td></tr>
            </table>
          </div>

          ${Object.keys(user.favoriteItems || {}).length > 0 ? `
          <div class="section">
            <div class="section-title">Items Favoritos</div>
            <table>
              <tr><th>Item</th><th>Cantidad</th></tr>
              ${Object.entries(user.favoriteItems || {}).map(([item, count]) => 
                `<tr><td>${item}</td><td>${count}</td></tr>`
              ).join('')}
            </table>
          </div>
          ` : ''}

          <script>window.print();</script>
        </body>
      </html>
    `;
  };

  // Función principal para exportar a PDF
  const exportToPDF = () => {
    let htmlContent = '';
    
    switch (data.reportType) {
      case 'general':
        if (data.statistics) {
          htmlContent = generateGeneralStatsPDFHTML(data.statistics);
        }
        break;
      case 'single-user':
        if (data.singleUser) {
          htmlContent = generateSingleUserPDFHTML(data.singleUser);
        }
        break;
      case 'users':
        // Para múltiples usuarios, podríamos generar un reporte resumido
        if (data.userMetrics) {
          htmlContent = `
            <html>
              <head><title>Reporte de Usuarios</title></head>
              <body>
                <h1>Reporte de Usuarios - Lavandería</h1>
                <p>Total de usuarios: ${data.userMetrics.length}</p>
                <p>Para reportes detallados, por favor exporte cada usuario individualmente.</p>
                <script>window.print();</script>
              </body>
            </html>
          `;
        }
        break;
    }

    if (htmlContent) {
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
      }
    }
  };

  // Render props pattern - devolvemos las funciones de exportación
  return (
    <>
      {children({
        exportToCSV,
        exportToPDF
      })}
    </>
  );
};

export default StatisticsExport;