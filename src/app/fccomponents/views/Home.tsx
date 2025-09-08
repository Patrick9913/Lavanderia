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

    const ticketDate = tickets?.map((t) => t.date?.toDate().toLocaleDateString())


    return (
        <section className=" bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-scroll">
            <div className=" flex h-fit gap-x-2 mb-8">
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaParachuteBox className="w-5 h-10" />
                    <span>Recibidas</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <FaBoxesPacking className="w-5 h-10" />
                    <span>En Proceso</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsBox2Fill className="w-5 h-10" />
                    <span>Listas</span>
                </button>
                <button className="bg-blue-500 cursor-pointer text-white px-6 py-1 rounded-md text-sm flex items-center gap-x-2">
                    <BsFillBox2HeartFill className="w-5 h-10" />
                    <span>Entregadas</span>
                </button>
            </div>
            <h2 className=" text-3xl font-light mb-8">Tickets</h2>
            <button onClick={() => setMenu(5)} className=" bg-blue-500 cursor-pointer text-sm text-white px-6 py-1 w-fit rounded text-start mb-8">Nuevo Ticket</button>
            <div>
                <MagicMotion>
                    <div className="divide-y w-full border rounded-md bg-white">
                        {tickets?.map((t, i) =>
                            users
                            ?.filter((u) => u.id === t.uid)
                            .map((u) => (
                                <div
                                key={i}
                                className="px-4 py-3 hover:bg-gray-50 transition"
                                >
                                {/* Encabezado clickable */}
                                <details className="group">
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
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
                            ))
                        )}
                    </div>
                </MagicMotion>
            </div>
        </section>
    )
}