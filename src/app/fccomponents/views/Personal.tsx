    'use client';
    import React, { useMemo, useState } from "react";
    import { usePeople } from "@/app/context/peoplecontext";
    import type { USER_PROPS } from "@/app/types";
    import Swal from "sweetalert2";

    type ViewMode = "list" | "newUser" | "newEmpresa" | "editUser";

    const Personal: React.FC = () => {
    const { users, empresas, crearUsuario, crearEmpresa, editarUsuario, usersLoading, lastError } = usePeople();

    const [dniQuery, setDniQuery] = useState<string>("");
    const [nameQuery, setNameQuery] = useState<string>("");
    const [empresaQuery, setEmpresaQuery] = useState<string>("");

    const filteredUsers = useMemo(() => {
        const base = users ?? [];
        const qDni = dniQuery.trim();
        const qName = nameQuery.trim().toLowerCase();
        const qEmp = empresaQuery.trim().toLowerCase();

        return base.filter((u) => {
        const fullName = `${u.name ?? ""} ${u.lastname ?? ""}`.toLowerCase();
        const empresa = (u.originCompany ?? "").toLowerCase();
        const okDni = !qDni || (u.dni?.toString() ?? "").includes(qDni);
        const okName = !qName || fullName.includes(qName);
        const okEmp = !qEmp || empresa.includes(qEmp);
        return okDni && okName && okEmp;
        });
    }, [users, dniQuery, nameQuery, empresaQuery]);

    const [mode, setMode] = useState<ViewMode>("list");

    const [newUser, setNewUser] = useState({
        name: "",
        lastname: "",
        dni: "",
        empresaId: "",
        mail: "",
    });

    const submitNewUser = async () => {
        if (!newUser.name.trim() || !newUser.lastname.trim() || !newUser.dni.trim()) {
        return Swal.fire({ icon: "warning", title: "Faltan datos", text: "Completá nombre, apellido y DNI." });
        }
        try {
        await crearUsuario({
            name: newUser.name,
            lastname: newUser.lastname,
            dni: newUser.dni,
            empresaId: newUser.empresaId || undefined,
            mail: newUser.mail.trim(),
        });
        Swal.fire({ icon: "success", title: "Personal agregado", timer: 1200 });
        setNewUser({ name: "", lastname: "", dni: "", empresaId: "", mail: "" });
        setMode("list");
        } catch (e) {
        Swal.fire({ icon: "error", title: "No se pudo crear", text: String(e) });
        }
    };

    const [newEmp, setNewEmp] = useState({ nombre: "", pais: "" });

    const submitNewEmp = async () => {
        if (!newEmp.nombre.trim()) {
        return Swal.fire({ icon: "warning", title: "Faltan datos", text: "Completá el nombre de la empresa." });
        }
        try {
        await crearEmpresa({ nombre: newEmp.nombre, pais: newEmp.pais });
        Swal.fire({ icon: "success", title: "Empresa creada", timer: 1200 });
        setNewEmp({ nombre: "", pais: "" });
        setMode("list");
        } catch (e) {
        Swal.fire({ icon: "error", title: "No se pudo crear la empresa", text: String(e) });
        }
    };

    const [editing, setEditing] = useState<USER_PROPS | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        lastname: "",
        dni: "",
        mail: "",
    });
    const [editEmpresaId, setEditEmpresaId] = useState<string>("");

    const openEdit = (u: USER_PROPS) => {
        setEditing(u);
        setEditForm({
        name: u.name ?? "",
        lastname: u.lastname ?? "",
        dni: u.dni?.toString() ?? "",
        mail: u.mail ?? "",
        });
        const match = (empresas ?? []).find(
        (e) => (e.nombre ?? "").toLowerCase() === (u.originCompany ?? "").toLowerCase()
        );
        setEditEmpresaId(match?.id ?? "");
        setMode("editUser");
    };

    const submitEditUser = async () => {
        if (!editing?.id) return;
        try {
        const originCompanyPatch: { originCompany?: string } = {};
        if (editEmpresaId) {
            const chosen = (empresas ?? []).find((e) => e.id === editEmpresaId);
            if (chosen?.nombre) originCompanyPatch.originCompany = chosen.nombre;
        } else {
        }

        await editarUsuario(editing.id, {
            name: editForm.name,
            lastname: editForm.lastname,
            mail: editForm.mail,
            dni: editForm.dni.replace(/\D/g, ""),
            ...originCompanyPatch,
        });

        Swal.fire({ icon: "success", title: "Datos actualizados", timer: 1000 });

        // limpiar estado y volver a la lista
        setEditing(null);
        setEditForm({ name: "", lastname: "", dni: "", mail: "" });
        setEditEmpresaId("");
        setMode("list");
        } catch (e) {
        Swal.fire({ icon: "error", title: "No se pudo actualizar", text: String(e) });
        }
    };

    return (
        <section className="bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-scroll">
        <h2 className="text-3xl font-light mb-2">Personal</h2>

        <div className="w-full mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex flex-col sm:flex-row flex-1 gap-3">
                <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Buscar Nombre y Apellido..."
                className="border rounded px-2 py-1 text-sm w-full sm:w-56"
                disabled={mode !== "list"}
                />
                <input
                type="text"
                inputMode="numeric"
                value={dniQuery}
                onChange={(e) => setDniQuery(e.target.value.replace(/\D/g, ""))}
                placeholder="Buscar DNI..."
                className="border rounded px-2 py-1 text-sm w-full sm:w-40"
                disabled={mode !== "list"}
                />
                <input
                type="text"
                value={empresaQuery}
                onChange={(e) => setEmpresaQuery(e.target.value)}
                placeholder="Buscar Empresa..."
                className="border rounded px-2 py-1 text-sm w-full sm:w-56"
                disabled={mode !== "list"}
                />
                <button
                onClick={() => { setNameQuery(""); setDniQuery(""); setEmpresaQuery(""); }}
                className="px-4 py-1 rounded text-sm text-white bg-gray-600 hover:bg-gray-700 w-full sm:w-auto"
                disabled={mode !== "list"}
                >
                Limpiar filtros
                </button>
            </div>

            {mode === "list" && (
                <div className="flex gap-2 w-full md:w-auto md:ml-auto">
                <button
                    onClick={() => setMode("newUser")}
                    className="px-4 py-1 rounded text-sm text-white bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                >
                    + Nuevo personal
                </button>
                <button
                    onClick={() => setMode("newEmpresa")}
                    className="px-4 py-1 rounded text-sm text-white bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                >
                    + Crear empresa
                </button>
                </div>
            )}
            </div>
        </div>

        {usersLoading && <div className="text-sm text-gray-500 mb-4">Cargando personal...</div>}
        {lastError && <div className="text-sm text-red-600 mb-4">Error: {lastError}</div>}

        {mode === "list" && (
            <div className="divide-y w-full border rounded-md bg-white">
            {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay resultados. Probá limpiar los filtros.</div>
            ) : (
                filteredUsers.map((u) => (
                <div key={u.id} className="px-4 py-3 hover:bg-gray-50 transition">
                    <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                        <div className="flex items-start gap-3">
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                            <p className="font-medium">
                                {u.name} {u.lastname}{" "}
                                <span className="text-gray-500 text-sm">({u.dni ?? "—"})</span>
                            </p>
                            </div>
                            <a href={`mailto:${u.mail}`} className="text-xs text-blue-600 hover:underline">
                            {u.mail ?? "—"}
                            </a>
                            <div className="text-[11px] text-gray-600 mt-1">Empresa: {u.originCompany ?? "—"}</div>
                        </div>
                        </div>

                        <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 rounded border text-sm"
                            onClick={(e) => { e.preventDefault(); openEdit(u); }}
                        >
                            Editar
                        </button>
                        </div>
                    </summary>
                    </details>
                </div>
                ))
            )}
            </div>
        )}

        {mode === "newUser" && (
            <div className="w-full border rounded-md bg-white p-4">
            <h3 className="text-lg font-semibold mb-3">Agregar nuevo personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-gray-600">Nombre</label>
                <input className="w-full border rounded px-2 py-1" value={newUser.name}
                        onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Apellido</label>
                <input className="w-full border rounded px-2 py-1" value={newUser.lastname}
                        onChange={(e) => setNewUser((s) => ({ ...s, lastname: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">DNI</label>
                <input className="w-full border rounded px-2 py-1" inputMode="numeric" value={newUser.dni}
                        onChange={(e) => setNewUser((s) => ({ ...s, dni: e.target.value.replace(/\D/g, "") }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Email</label>
                <input type="email" className="w-full border rounded px-2 py-1" value={newUser.mail}
                        onChange={(e) => setNewUser((s) => ({ ...s, mail: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Empresa</label>
                <select className="w-full border rounded px-2 py-1" value={newUser.empresaId}
                        onChange={(e) => setNewUser((s) => ({ ...s, empresaId: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {(empresas ?? []).map((em) => (
                    <option key={em.id} value={em.id}>{em.nombre}{em.pais ? ` (${em.pais})` : ""}</option>
                    ))}
                </select>
                {(empresas?.length ?? 0) === 0 && (
                    <p className="text-[11px] text-gray-500 mt-1">No hay empresas cargadas. Creá una con “Crear empresa”.</p>
                )}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
                <button className="px-4 py-1 rounded border" onClick={() => setMode("list")}>Cancelar</button>
                <button className="px-4 py-1 rounded text-white bg-emerald-600 hover:bg-emerald-700"
                        onClick={submitNewUser}>Guardar</button>
            </div>
            </div>
        )}

        {mode === "newEmpresa" && (
            <div className="w-full border rounded-md bg-white p-4">
            <h3 className="text-lg font-semibold mb-3">Crear empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-gray-600">Nombre de empresa</label>
                <input className="w-full border rounded px-2 py-1" value={newEmp.nombre}
                        onChange={(e) => setNewEmp((s) => ({ ...s, nombre: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">País</label>
                <input className="w-full border rounded px-2 py-1" value={newEmp.pais}
                        onChange={(e) => setNewEmp((s) => ({ ...s, pais: e.target.value }))}/>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
                <button className="px-4 py-1 rounded border" onClick={() => setMode("list")}>Cancelar</button>
                <button className="px-4 py-1 rounded text-white bg-emerald-600 hover:bg-emerald-700"
                        onClick={submitNewEmp}>Guardar</button>
            </div>
            </div>
        )}

        {mode === "editUser" && editing && (
            <div className="w-full border rounded-md bg-white p-4">
            <h3 className="text-lg font-semibold mb-3">Editar personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-gray-600">Nombre</label>
                <input className="w-full border rounded px-2 py-1"
                        value={editForm.name}
                        onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Apellido</label>
                <input className="w-full border rounded px-2 py-1"
                        value={editForm.lastname}
                        onChange={(e) => setEditForm((s) => ({ ...s, lastname: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">DNI</label>
                <input className="w-full border rounded px-2 py-1" inputMode="numeric"
                        value={editForm.dni}
                        onChange={(e) => setEditForm((s) => ({ ...s, dni: e.target.value.replace(/\D/g, "") }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Email</label>
                <input className="w-full border rounded px-2 py-1"
                        value={editForm.mail}
                        onChange={(e) => setEditForm((s) => ({ ...s, mail: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Empresa</label>
                <select className="w-full border rounded px-2 py-1"
                        value={editEmpresaId}
                        onChange={(e) => setEditEmpresaId(e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {(empresas ?? []).map((em) => (
                    <option key={em.id} value={em.id}>{em.nombre}{em.pais ? ` (${em.pais})` : ""}</option>
                    ))}
                </select>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
                <button className="px-4 py-1 rounded border"
                        onClick={() => { setEditing(null); setEditForm({ name: "", lastname: "", dni: "", mail: "" }); setEditEmpresaId(""); setMode("list"); }}>
                Cancelar
                </button>
                <button className="px-4 py-1 rounded text-white bg-black"
                        onClick={submitEditUser}>
                Guardar cambios
                </button>
            </div>
            </div>
        )}
        </section>
    );
    };

    export default Personal;
