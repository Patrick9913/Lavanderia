import React, { useMemo, useState, useEffect } from "react";
import { FaParachuteBox } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { BsBox2Fill } from "react-icons/bs";
import { BsFillBox2HeartFill } from "react-icons/bs";
import { useAppContext } from "@/app/context/appcontext";
import { STATE_PROPS } from "@/app/types";

export const Home: React.FC = () => {

    const { tickets, users, updateTicketState, setMenu } = useAppContext();

    // Selección múltiple y cambio masivo de estado
    const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([])
    const [bulkNextState, setBulkNextState] = useState<number | "">("")
    // Filtro por DNI
    const [dniQuery, setDniQuery] = useState<string>("")
    // Paginación
    const [ticketsPerPage, setTicketsPerPage] = useState<number>(10)
    const [currentPage, setCurrentPage] = useState<number>(1)

    const userById = useMemo(() => {
        const index: Record<string, any> = {}
        users?.forEach((u) => { if (u.id) index[u.id] = u })
        return index
    }, [users])

    const filteredTickets = useMemo(() => {
        const base = tickets ?? []
        const q = dniQuery.trim()
        if (!q) return base
        return base.filter((t) => {
            const u = userById[t.uid as string]
            if (!u) return false
            return (u.dni?.toString() ?? "").includes(q)
        })
    }, [tickets, userById, dniQuery])

    const allTicketIds = useMemo(() => (filteredTickets.map((t) => t.id as string)), [filteredTickets])
    const allSelected = useMemo(() => allTicketIds.length > 0 && selectedTicketIds.length === allTicketIds.length, [allTicketIds, selectedTicketIds])

    const received = useMemo(() => filteredTickets?.filter((t) => t.state === 1), [filteredTickets])
    const inProcess = useMemo(() => filteredTickets?.filter((t) => t.state === 2), [filteredTickets])
    const list = useMemo(() => filteredTickets?.filter((t) => t.state === 3), [filteredTickets])
    const delivered = useMemo(() => filteredTickets?.filter((t) => t.state === 4), [filteredTickets])

    // Cálculos de paginación
    const totalTickets = filteredTickets.length
    const totalPages = Math.ceil(totalTickets / ticketsPerPage)
    const startIndex = (currentPage - 1) * ticketsPerPage
    const endIndex = startIndex + ticketsPerPage
    const paginatedTickets = useMemo(() => filteredTickets.slice(startIndex, endIndex), [filteredTickets, startIndex, endIndex])

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [dniQuery, ticketsPerPage])

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedTicketIds(allTicketIds)
        else setSelectedTicketIds([])
    }

    const toggleSelectOne = (ticketId: string, checked: boolean) => {
        setSelectedTicketIds((prev) => {
            if (checked) return Array.from(new Set([...prev, ticketId]))
            return prev.filter((id) => id !== ticketId)
        })
    }

    const handleBulkUpdate = async () => {
        if (!bulkNextState || selectedTicketIds.length === 0) return
        await Promise.all(selectedTicketIds.map((id) => updateTicketState(id, Number(bulkNextState))))
        setSelectedTicketIds([])
        setBulkNextState("")
    }

    const ticketDate = tickets?.map((t) => t.date?.toDate().toLocaleDateString())


    return (
        <section className=" bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-auto">
            <div className=" flex h-fit gap-x-2 mb-8">
                <button className=" py-2 px-6 rounded bg-blue-200 cursor-pointer text-sm flex items-center gap-x-2">
                    <FaParachuteBox className="w-5 h-10 text-blue-500" />
                    <span>Recibidas <span className=" font-bold">{received?.length}</span></span>
                </button>
                <button className=" py-2 px-6 rounded bg-blue-200 cursor-pointer text-sm flex items-center gap-x-2">
                    <FaBoxesPacking className="w-5 h-10 text-blue-500" />
                    <span>En Proceso <span className=" font-bold">{inProcess?.length}</span></span>
                </button>
                <button className=" py-2 px-6 rounded bg-blue-200 cursor-pointer text-sm flex items-center gap-x-2">
                    <BsBox2Fill className="w-5 h-10 text-blue-500" />
                    <span>Listas <span className=" font-bold">{list?.length}</span></span>
                </button>
                <button className=" py-2 px-6 rounded bg-blue-200 cursor-pointer text-sm flex items-center gap-x-2">
                    <BsFillBox2HeartFill className="w-5 h-10 text-blue-500" />
                    <span>Entregadas <span className=" font-bold">{delivered?.length}</span></span>
                </button>
            </div>
            <h2 className="text-3xl font-light text-gray-800 mb-2">Tickets</h2>
            {/* Panel integrado de filtros y paginación */}
            <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/30 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 ease-out mb-6">
                {/* Fila superior: Filtros y controles principales */}
                <div className="p-4 border-b border-gray-200/50">
                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={dniQuery}
                            onChange={(e) => setDniQuery(e.target.value)}
                            placeholder="Buscar DNI..."
                            className=" border focus:outline-none  p-2 rounded bg-white text-sm"
                        />
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={allSelected}
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                            />
                            <span>Seleccionar todo</span>
                        </label>
                        <select
                            value={bulkNextState as any}
                            onChange={(e) => setBulkNextState(e.target.value === "" ? "" : Number(e.target.value))}
                            className=" p-2 bg-white rounded border text-sm"
                        >
                            <option value="">Cambiar estado a...</option>
                            <option value={1}>{STATE_PROPS[1]}</option>
                            <option value={2}>{STATE_PROPS[2]}</option>
                            <option value={3}>{STATE_PROPS[3]}</option>
                            <option value={4}>{STATE_PROPS[4]}</option>
                        </select>
                        <button
                            onClick={handleBulkUpdate}
                            disabled={!bulkNextState || selectedTicketIds.length === 0}
                            className={`md-btn ${(!bulkNextState || selectedTicketIds.length === 0) ? "md-btn-outlined cursor-not-allowed opacity-60" : "md-btn-filled"}`}
                        >
                            Aplicar a seleccionados ({selectedTicketIds.length})
                        </button>
                        <button onClick={() => setMenu(5)} className="hover:scale-[1.02] group transition-all ease-in hover:bg-blue-50 hover:border-blue-200/60 hover:shadow-lg rounded-md px-6 py-2 cursor-pointer text-sm ml-auto relative">
                            Nuevo Ticket
                            <div className=" hidden animate-ping absolute right-2 top-[17px] group-hover:block w-1 h-1 rounded-full bg-blue-600"></div>
                        </button>
                    </div>
                </div>
                
                {/* Fila inferior: Controles de paginación */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">
                            Mostrar:
                        </label>
                        <div className="relative group">
                            <select
                                value={ticketsPerPage}
                                onChange={(e) => setTicketsPerPage(Number(e.target.value))}
                                className="
                                    appearance-none bg-white border-2 border-gray-200 rounded-lg px-3 py-2 pr-8
                                    text-sm font-medium text-gray-700 min-w-[70px]
                                    hover:border-blue-300 hover:shadow-md
                                    focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                    transition-all duration-300 ease-out
                                    cursor-pointer
                                "
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                            tickets por página
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg border border-gray-200/50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-gray-800">
                                Página <span className="text-blue-600">{currentPage}</span> de <span className="text-blue-600">{totalPages}</span>
                            </span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <span className="text-sm text-gray-600">
                            {totalTickets} tickets total
                        </span>
                    </div>
                </div>
            </div>

            {/* Navegación de páginas con estilo Google */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm">
                    {/* Botón Anterior */}
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`
                            group relative flex items-center gap-x-2 px-4 py-2.5 rounded-lg
                            text-sm font-medium transition-all duration-300 ease-out
                            transform-gpu will-change-transform
                            ${currentPage === 1 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100/50' 
                                : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]'
                            }
                        `}
                    >
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Anterior</span>
                    </button>
                    
                    {/* Números de página */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            const isActive = currentPage === pageNum;
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`
                                        group relative flex items-center justify-center w-10 h-10 rounded-lg
                                        text-sm font-semibold transition-all duration-300 ease-out
                                        transform-gpu will-change-transform
                                        ${isActive 
                                            ? 'bg-blue-600 text-white shadow-lg scale-110 border-2 border-blue-700' 
                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:scale-105 active:scale-95'
                                        }
                                    `}
                                >
                                    {pageNum}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-blue-400 rounded-lg animate-pulse opacity-30"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Botón Siguiente */}
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`
                            group relative flex items-center gap-x-2 px-4 py-2.5 rounded-lg
                            text-sm font-medium transition-all duration-300 ease-out
                            transform-gpu will-change-transform
                            ${currentPage === totalPages 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100/50' 
                                : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]'
                            }
                        `}
                    >
                        <span>Siguiente</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
            <div>
                <div className=" w-full md-card">
                    {paginatedTickets?.map((t, i) => {
                        
                        const isFirst = i === 0;
                        const isLast = i === paginatedTickets.length - 1;

                        const roundedClass = isFirst
                            ? "rounded-t-lg"
                            : isLast
                            ? "rounded-b-lg"
                            : "";
                            
                        const u = userById[t.uid as string]
                        if (!u) return null
                        return (
                            <div
                            key={i}
                            className={`p-4 border border-blue-100/60 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 ${roundedClass}`}
                            >
                            {/* Encabezado clickable */}
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4"
                                            checked={selectedTicketIds.includes(t.id as string)}
                                            onChange={(e) => toggleSelectOne(t.id as string, e.target.checked)}
                                        />
                                        <div className="flex flex-col items-start">
                                        <div className="flex flex-col items-start gap-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    (t.state == 1 && "bg-blue-500 text-white") ||
                                                    (t.state == 2 && "bg-yellow-500 text-white") ||
                                                    (t.state == 3 && "bg-emerald-500 text-white") ||
                                                    (t.state == 4 && "bg-gray-600 text-white")
                                                }`}
                                            >
                                                {STATE_PROPS[t.state]}
                                            </span>
                                            <p className="font-medium">
                                                {u.name} {u.lastname} <span className="text-gray-500 text-sm">({u.dni})</span>
                                            </p>
                                        </div>
                                        <a href={`mailto:${u.mail}`} className="text-xs text-blue-600 hover:underline">
                                            {u.mail}
                                        </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end text-sm text-gray-600">
                                        <span>{t.date.toDate().toLocaleDateString()}</span>
                                        <span className="text-emerald-600 font-mono text-xs">{t.uid}</span>
                                    </div>
                                </summary>

                                {/* Cuerpo expandible */}
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-medium mb-1">Descripción</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{t.description || "Sin descripción"}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">Items</h4>
                                        {t.items ? (
                                            <ul className="list-disc list-inside text-gray-700">
                                                {Object.entries(t.items).map(([k, v]) => (
                                                    <li key={k}>{k}: {v}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">Sin items</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <h4 className="font-medium mb-1">Estado</h4>
                                        <select
                                            value={t.state}
                                            onChange={(e) => updateTicketState(t.id as string, Number(e.target.value))}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value={1}>{STATE_PROPS[1]}</option>
                                            <option value={2}>{STATE_PROPS[2]}</option>
                                            <option value={3}>{STATE_PROPS[3]}</option>
                                            <option value={4}>{STATE_PROPS[4]}</option>
                                        </select>
                                    </div>
                                </div>
                            </details>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}