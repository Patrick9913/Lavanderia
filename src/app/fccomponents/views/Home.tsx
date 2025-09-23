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
        <section className="rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-auto">
            <div className=" flex h-fit gap-x-2 mb-8">
                <button className="md-btn md-btn-tonal cursor-pointer text-sm flex items-center gap-x-2">
                    <FaParachuteBox className="w-5 h-10" />
                    <span>Recibidas {received?.length}</span>
                </button>
                <button className="md-btn md-btn-tonal cursor-pointer text-sm flex items-center gap-x-2">
                    <FaBoxesPacking className="w-5 h-10" />
                    <span>En Proceso {inProcess?.length}</span>
                </button>
                <button className="md-btn md-btn-tonal cursor-pointer text-sm flex items-center gap-x-2">
                    <BsBox2Fill className="w-5 h-10" />
                    <span>Listas {list?.length}</span>
                </button>
                <button className="md-btn md-btn-tonal cursor-pointer text-sm flex items-center gap-x-2">
                    <BsFillBox2HeartFill className="w-5 h-10" />
                    <span>Entregadas {delivered?.length}</span>
                </button>
            </div>
            <h2 className="text-3xl font-light text-gray-800 mb-2">Tickets</h2>
            <div className="md-card p-4 flex flex-wrap items-center gap-3 mb-6">
                <input
                    type="text"
                    inputMode="numeric"
                    value={dniQuery}
                    onChange={(e) => setDniQuery(e.target.value)}
                    placeholder="Buscar DNI..."
                    className="md-input text-sm"
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
                    className="md-input text-sm"
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
            </div>
            <button onClick={() => setMenu(5)} className="md-btn md-btn-filled cursor-pointer text-sm w-fit mb-8">
                Nuevo Ticket
            </button>
            
            {/* Controles de paginación */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700">Mostrar:</label>
                    <select
                        value={ticketsPerPage}
                        onChange={(e) => setTicketsPerPage(Number(e.target.value))}
                        className="md-input text-sm w-20"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">tickets por página</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages} ({totalTickets} tickets total)
                    </span>
                </div>
            </div>

            {/* Navegación de páginas */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`md-btn ${currentPage === 1 ? "md-btn-outlined cursor-not-allowed opacity-60" : "md-btn-tonal"} text-sm`}
                    >
                        Anterior
                    </button>
                    
                    <div className="flex items-center gap-1">
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
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`md-btn ${currentPage === pageNum ? "md-btn-filled" : "md-btn-outlined"} text-sm w-10`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`md-btn ${currentPage === totalPages ? "md-btn-outlined cursor-not-allowed opacity-60" : "md-btn-tonal"} text-sm`}
                    >
                        Siguiente
                    </button>
                </div>
            )}
            <div>
                <div className="divide-y w-full md-card">
                    {paginatedTickets?.map((t, i) => {
                        const u = userById[t.uid as string]
                        if (!u) return null
                        return (
                            <div
                            key={i}
                            className="px-4 py-3 hover:bg-gray-50 transition"
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