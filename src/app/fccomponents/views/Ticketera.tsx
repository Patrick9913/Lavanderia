"use client"

import React from "react";
import { useAppContext } from "@/app/context/appcontext";
import { MagicMotion } from "react-magic-motion";
 

export const Ticketera: React.FC = () => {
  const {
    userDni,
    setUserDni,
    items,
    toggleItem,
    prendas,
    selectedUser,
    createTicket,
    setDescription
  } = useAppContext();

  return (
    <section className="bg-white rounded flex-1 flex flex-col w-full h-full max-h-screen p-5 overflow-y-scroll">
      <h2 className="text-3xl font-light mb-8">Generar nuevo ticket</h2>
      <MagicMotion>
        <div className="flex flex-1 flex-col gap-4">
          {/* Campo DNI */}
          <div>
            <label className="block text-sm mb-1">DNI</label>
            <input
              type="text"
              value={userDni}
              onChange={(e) => setUserDni(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              placeholder="Ingrese DNI"
            />
          </div>
          {/* Datos autocompletados */}
          {selectedUser && (
            <div className=" *:text-sm flex gap-x-5 flex-1">
              <div className=" flex flex-col w-1/2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    readOnly
                    className="border rounded px-3 py-2 w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido</label>
                  <input
                    type="text"
                    value={selectedUser.lastname}
                    readOnly
                    className="border rounded px-3 py-2 w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.mail}
                    readOnly
                    className="border rounded px-3 py-2 w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nacionalidad</label>
                  <input
                    type="text"
                    value={selectedUser.nationality}
                    readOnly
                    className="border rounded px-3 py-2 w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nacionalidad</label>
                  <input
                    type="text"
                    value={selectedUser.originCompany}
                    readOnly
                    className="border rounded px-3 py-2 w-full bg-gray-100"
                  />
                </div>

              </div>
              {/* Selección de prendas */}
              <div className=" flex flex-col flex-1">
                <div className=" flex flex-col gap-4">
                  <h3 className="text-lg font-light">Prendas</h3>  
                  <div className="w-full flex flex-wrap gap-x-2">
                    {prendas.map((prenda) => {
                    const selected = items[prenda] > 0;

                    return (
                      <div key={prenda} className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => toggleItem(prenda, selected ? 0 : 1)}
                          className={`px-4 py-2 rounded-md text-sm transition ${
                            selected
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {prenda}
                        </button>

                        {selected && (
                          <input
                            type="number"
                            min={1}
                            value={items[prenda]}
                            onChange={(e) =>
                              toggleItem(prenda, parseInt(e.target.value) || 0)
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        )}
                      </div>
                      );
                    })}
                  </div>
                  <textarea onChange={(e) => setDescription?.(e.target.value)} placeholder="Observación" className=" p-2 rounded resize-none border" name="" id=""></textarea>
                  {/* Botón Enviar */}
                </div>
                <button
                    onClick={createTicket}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Generar Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </MagicMotion>
    </section>
  );
};
