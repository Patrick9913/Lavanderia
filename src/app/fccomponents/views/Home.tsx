import React, { useMemo, useState } from "react";
import { FaParachuteBox } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { BsBox2Fill } from "react-icons/bs";
import { BsFillBox2HeartFill } from "react-icons/bs";
import { useAppContext } from "@/app/context/appcontext";
import { STATE_PROPS } from "@/app/types";
import { MagicMotion } from "react-magic-motion";

export const Home: React.FC = () => {

    const { tickets, users, updateTicketState, setMenu } = useAppContext();

    // Selección múltiple y cambio masivo de estado
    const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([])
    const [bulkNextState, setBulkNextState] = useState<number | "">("")
    // Filtro por DNI
    const [dniQuery, setDniQuery] = useState<string>("")

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
        <section className=" bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-scroll">
            <div className=" flex h-fit gap-x-2 mb-8">
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaParachuteBox className="w-5 h-10" />
                    <span>Recibidas {received?.length}</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaBoxesPacking className="w-5 h-10" />
                    <span>En Proceso {inProcess?.length}</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsBox2Fill className="w-5 h-10" />
                    <span>Listas {list?.length}</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsFillBox2HeartFill className="w-5 h-10" />
                    <span>Entregadas {delivered?.length}</span>
                </button>
            </div>
            <h2 className=" text-3xl font-light mb-2">Tickets</h2>
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <input
                    type="text"
                    inputMode="numeric"
                    value={dniQuery}
                    onChange={(e) => setDniQuery(e.target.value)}
                    placeholder="Buscar DNI..."
                    className="border rounded px-2 py-1 text-sm"
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
                    className="border rounded px-2 py-1 text-sm"
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
                    className={`px-4 py-1 rounded text-sm text-white ${(!bulkNextState || selectedTicketIds.length === 0) ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                    Aplicar a seleccionados ({selectedTicketIds.length})
                </button>
            </div>
            <button onClick={() => setMenu(5)} className=" bg-blue-500 cursor-pointer text-sm text-white px-6 py-1 w-fit rounded text-start mb-8">Nuevo Ticket</button>
            <div>
                <div className="divide-y w-full border rounded-md bg-white">
                    {filteredTickets?.map((t, i) => {
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