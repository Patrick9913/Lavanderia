"use client"

import React, { useState } from "react";
import { useAppContext } from "@/app/context/appcontext";
import { db } from "@/app/config";
import { addDoc, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";

export const Ticketera: React.FC = () => {
  const [userDni, setUserDni] = useState("");
  const [items, setItems] = useState<{ [key: string]: number }>({});
  const { users } = useAppContext();

  // Buscar usuario por DNI
  const userData = users?.find((u) => u.dni.toString() === userDni);

  // Opciones fijas de prendas
  const prendas = ["Camisas", "Pantalones", "Medias", "Remeras", "Abrigos"];

  const toggleItem = (item: string, cantidad: number) => {
    setItems((prev) => ({
      ...prev,
      [item]: cantidad,
    }));
  };

  const handleSubmit = async () => {
    if (!userData) return;

    try {
      // 1. Crear ticket en colección "tickets"
      const ticketRef = await addDoc(collection(db, "tickets"), {
        userId: userData.id,
        dni: userData.dni,
        items: items,
        createdAt: new Date(),
      });

      // 2. Empujar el ID de ticket al usuario
      if (!userData?.id) {
        alert("El usuario no tiene un ID válido");
        return;
        }

        const userRef = doc(db, "users", userData.id);
        await updateDoc(userRef, {
        tickets: arrayUnion(ticketRef.id),
        });

      alert("✅ Ticket generado correctamente");
      setItems({});
      setUserDni("");
    } catch (error) {
      console.error("Error creando ticket:", error);
      alert("❌ Hubo un error generando el ticket");
    }
  };

  return (
    <section className="bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-scroll">
      <h2 className="text-3xl font-light mb-8">Generar nuevo ticket</h2>

      <div className="flex flex-col gap-4 max-w-md">
        {/* Campo DNI */}
        <div>
          <label className="block text-sm font-medium mb-1">DNI</label>
          <input
            type="text"
            value={userDni}
            onChange={(e) => setUserDni(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Ingrese DNI"
          />
        </div>

        {/* Datos autocompletados */}
        {userData && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={userData.name}
                readOnly
                className="border rounded px-3 py-2 w-full bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                type="text"
                value={userData.lastname}
                readOnly
                className="border rounded px-3 py-2 w-full bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={userData.mail}
                readOnly
                className="border rounded px-3 py-2 w-full bg-gray-100"
              />
            </div>

            {/* Selección de prendas */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Prendas</h3>
              {prendas.map((prenda) => (
                <div key={prenda} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!items[prenda]}
                    onChange={(e) =>
                      toggleItem(prenda, e.target.checked ? 1 : 0)
                    }
                  />
                  <label className="w-32">{prenda}</label>
                  {items[prenda] > 0 && (
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
              ))}
            </div>

            {/* Botón Enviar */}
            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Generar Ticket
            </button>
          </>
        )}
      </div>
    </section>
  );
};
