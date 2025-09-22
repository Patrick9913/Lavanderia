"use client"

import React from "react";
import { useAppContext } from "@/app/context/appcontext";
 

export const Ticketera: React.FC = () => {
  const {
    userDni,
    setUserDni,
    items,
    toggleItem,
    prendas,
    selectedUser,
    createTicket,
    setDescription,
    setMenu
  } = useAppContext();

  const handleCancel = () => {
    // Resetear DNI y descripción
    setUserDni("");
    setDescription?.("");
    // Limpiar cantidades seleccionadas
    Object.entries(items || {}).forEach(([k, v]) => {
      if (v && v > 0) toggleItem(k, 0);
    });
  }

  return (
    <section className="md-surface rounded flex-1 flex flex-col w-full h-full max-h-screen p-5 overflow-y-auto">
      <h2 className="text-3xl font-light text-gray-800 mb-6">Generar nuevo ticket</h2>
      {/* Vista 1: Solo input centrado si no hay usuario seleccionado */}
      {!selectedUser && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center max-w-xl md-card p-6">
            <label className=" text-2xl font-light text-gray-600 mb-2">Ingrese un DNI para generar Tickets</label>
            <input
              type="text"
              value={userDni}
              onChange={(e) => setUserDni(e.target.value)}
              className="md-input px-4 py-3 w-full text-lg"
              placeholder="Ingrese DNI"
            />
          </div>
          <button className=" md-btn md-btn-outlined text-sm" onClick={() => setMenu(2)}>¿El usuario no existe?</button>
        </div>
      )}
      {/* Vista 2: Usuario + Prendas si hay match */}
      {selectedUser && (
        <div className="flex-1 flex flex-col gap-y-4 h-full">
          {/* Ficha pequeña arriba a la izquierda */}
          <div className="lg:col-span-3 md-card h-fit">
            <div className="px-3 py-2 border-b bg-gray-50 rounded-t-md">
              <h3 className="text-xs font-medium text-gray-800">Usuario</h3>
            </div>
            <div className="p-3 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] uppercase text-gray-500">Nombre</span>
                  <div className="border rounded px-2 py-1 bg-gray-100">{selectedUser.name}</div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-500">Apellido</span>
                  <div className="border rounded px-2 py-1 bg-gray-100">{selectedUser.lastname}</div>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase text-gray-500">Email</span>
                  <div className="border rounded px-2 py-1 bg-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">{selectedUser.mail}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prendas ocupando el resto del contenedor */}
          <div className=" flex-1 md-card w-full flex flex-col">
            <div className="px-4 py-3 border-b bg-gray-50 rounded-t-md">
              <h3 className="text-sm font-medium text-gray-800">Prendas y Observación</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col overflow-y-auto">
              <div className=" flex flex-wrap gap-2">
                {prendas.map((prenda) => {
                  const selected = items[prenda] > 0;
                  return (
                    <div key={prenda} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleItem(prenda, selected ? 0 : 1)}
                        className={`md-btn text-xs ${
                          selected
                            ? "md-btn-tonal"
                            : "md-btn-outlined"
                        }`}
                      >
                        {prenda}
                      </button>
                      {selected && (
                        <input
                          type="number"
                          min={1}
                          value={items[prenda]}
                          onChange={(e) => toggleItem(prenda, parseInt(e.target.value) || 0)}
                          className="md-input px-2 py-1 w-20 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex-1 h-full">
                <textarea onChange={(e) => setDescription?.(e.target.value)} placeholder="Añade información adicional..." className="p-2 rounded resize-none md-input w-full h-full" />
              </div>
            </div>
            <div className="px-4 py-3 border-t bg-white rounded-b-md flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="md-btn md-btn-outlined text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={createTicket}
                className="md-btn md-btn-filled text-sm"
              >
                Generar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
