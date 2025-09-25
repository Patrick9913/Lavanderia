    'use client';
    import React, { useMemo, useState, useEffect } from "react";
    import { usePeople } from "@/app/context/peoplecontext";
    import type { USER_PROPS } from "@/app/types";
    import Swal from "sweetalert2";

    type ViewMode = "list" | "newUser" | "newEmpresa" | "editUser";

    const Personal: React.FC = () => {
    const { users, empresas, crearUsuario, crearEmpresa, editarUsuario, usersLoading, lastError } = usePeople();

    const [dniQuery, setDniQuery] = useState<string>("");
    const [nameQuery, setNameQuery] = useState<string>("");
    const [empresaQuery, setEmpresaQuery] = useState<string>("");
    // Paginación
    const [usersPerPage, setUsersPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

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

    // Cálculos de paginación
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = useMemo(() => filteredUsers.slice(startIndex, endIndex), [filteredUsers, startIndex, endIndex]);

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [dniQuery, nameQuery, empresaQuery, usersPerPage]);

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
            dni: parseInt(editForm.dni.replace(/\D/g, ""), 10),
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
        <section className=" bg-white rounded flex-1 flex flex-col w-full h-full p-5 overflow-y-auto">
        <h2 className="text-3xl font-light text-gray-800 mb-2">Personal</h2>

        {/* Panel integrado de filtros y paginación */}
        <div className="bg-gradient-to-r from-gray-50/80 to-emerald-50/30 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 ease-out mb-6">
            {/* Fila superior: Filtros y controles principales */}
            <div className="p-4 border-b border-gray-200/50">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex flex-col sm:flex-row flex-1 gap-3">
                        <input
                            type="text"
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
                            placeholder="Buscar Nombre y Apellido..."
                            className="border focus:outline-none  p-2 rounded bg-white text-sm"
                            disabled={mode !== "list"}
                        />
                        <input
                            type="text"
                            inputMode="numeric"
                            value={dniQuery}
                            onChange={(e) => setDniQuery(e.target.value.replace(/\D/g, ""))}
                            placeholder="Buscar DNI..."
                            className="border focus:outline-none  p-2 rounded bg-white text-sm"
                            disabled={mode !== "list"}
                        />
                        <input
                            type="text"
                            value={empresaQuery}
                            onChange={(e) => setEmpresaQuery(e.target.value)}
                            placeholder="Buscar Empresa..."
                            className="border focus:outline-none  p-2 rounded bg-white text-sm"
                            disabled={mode !== "list"}
                        />
                        <button
                            onClick={() => { setNameQuery(""); setDniQuery(""); setEmpresaQuery(""); }}
                            className="md-btn md-btn-outlined w-full sm:w-auto"
                            disabled={mode !== "list"}
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    {mode === "list" && (
                        <div className="flex gap-2 w-full md:w-auto md:ml-auto">
                            <button
                                onClick={() => setMode("newUser")}
                                className="hover:scale-[1.02] group transition-all ease-in hover:bg-blue-50 hover:border-blue-200/60 hover:shadow-lg rounded-md px-6 py-2 cursor-pointer text-sm ml-auto relative bg-white border-2 border-blue-100 text-blue-600 flex items-center gap-2"
                            >
                                + Nuevo personal
                            </button>
                            <button
                                onClick={() => setMode("newEmpresa")}
                                className="hover:scale-[1.02] group transition-all ease-in hover:bg-blue-50 hover:border-blue-200/60 hover:shadow-lg rounded-md px-6 py-2 cursor-pointer text-sm ml-auto relative bg-white border-2 border-blue-100 text-blue-600 flex items-center gap-2"
                            >
                                + Crear empresa
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Fila inferior: Controles de paginación */}
            {mode === "list" && (
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">
                            Mostrar:
                        </label>
                        <div className="relative group">
                            <select
                                value={usersPerPage}
                                onChange={(e) => setUsersPerPage(Number(e.target.value))}
                                className="
                                    appearance-none bg-white border-2 border-gray-200 rounded-lg px-3 py-2 pr-8
                                    text-sm font-medium text-gray-700 min-w-[70px]
                                    hover:border-emerald-300 hover:shadow-md
                                    focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500
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
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                            usuarios por página
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg border border-gray-200/50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-gray-800">
                                Página <span className="text-emerald-600">{currentPage}</span> de <span className="text-emerald-600">{totalPages}</span>
                            </span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <span className="text-sm text-gray-600">
                            {totalUsers} usuarios total
                        </span>
                    </div>
                </div>
            )}
        </div>

        {usersLoading && <div className="text-sm text-gray-500 mb-4">Cargando personal...</div>}
        {lastError && <div className="text-sm text-red-600 mb-4">Error: {lastError}</div>}

        {mode === "list" && (
            <>

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
                                : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]'
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
                                            ? 'bg-emerald-600 text-white shadow-lg scale-110 border-2 border-emerald-700' 
                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md hover:scale-105 active:scale-95'
                                        }
                                    `}
                                >
                                    {pageNum}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-emerald-400 rounded-lg animate-pulse opacity-30"></div>
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
                                : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]'
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
            <div className="divide-y w-full md-card">
            {paginatedUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay resultados. Probá limpiar los filtros.</div>
            ) : (
                paginatedUsers.map((u, i) => {

                const isFirst = i === 0;
                        const isLast = i === paginatedUsers.length - 1;

                        const roundedClass = isFirst
                            ? "rounded-t-lg"
                            : isLast
                            ? "rounded-b-lg"
                            : "";
                
                return (
                    <div key={u.id} className={`p-4 border border-blue-100/60 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 ${roundedClass}`}>
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
                    )
                })
            )}
            </div>
            </>
        )}

        {mode === "newUser" && (
            <div className="w-full md-card p-4">
            <h3 className="text-lg font-semibold mb-3">Agregar nuevo personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-gray-600">Nombre</label>
                <input className="w-full md-input" value={newUser.name}
                        onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Apellido</label>
                <input className="w-full md-input" value={newUser.lastname}
                        onChange={(e) => setNewUser((s) => ({ ...s, lastname: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">DNI</label>
                <input className="w-full md-input" inputMode="numeric" value={newUser.dni}
                        onChange={(e) => setNewUser((s) => ({ ...s, dni: e.target.value.replace(/\D/g, "") }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Email</label>
                <input type="email" className="w-full md-input" value={newUser.mail}
                        onChange={(e) => setNewUser((s) => ({ ...s, mail: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Empresa</label>
                <select className="w-full md-input" value={newUser.empresaId}
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
                <button className="md-btn md-btn-outlined" onClick={() => setMode("list")}>Cancelar</button>
                <button className="md-btn md-btn-filled"
                        onClick={submitNewUser}>Guardar</button>
            </div>
            </div>
        )}

        {mode === "newEmpresa" && (
            <div className="w-full md-card p-4">
            <h3 className="text-lg font-semibold mb-3">Crear empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-gray-600">Nombre de empresa</label>
                <input className="w-full md-input" value={newEmp.nombre}
                        onChange={(e) => setNewEmp((s) => ({ ...s, nombre: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">País</label>
                <input className="w-full md-input" value={newEmp.pais}
                        onChange={(e) => setNewEmp((s) => ({ ...s, pais: e.target.value }))}/>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
                <button className="md-btn md-btn-outlined" onClick={() => setMode("list")}>Cancelar</button>
                <button className="md-btn md-btn-filled"
                        onClick={submitNewEmp}>Guardar</button>
            </div>
            </div>
        )}

        {mode === "editUser" && editing && (
            <div className="w-full md-card p-4">
            <h3 className="text-lg font-semibold mb-3">Editar personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-gray-600">Nombre</label>
                <input className="w-full md-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Apellido</label>
                <input className="w-full md-input"
                        value={editForm.lastname}
                        onChange={(e) => setEditForm((s) => ({ ...s, lastname: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">DNI</label>
                <input className="w-full md-input" inputMode="numeric"
                        value={editForm.dni}
                        onChange={(e) => setEditForm((s) => ({ ...s, dni: e.target.value.replace(/\D/g, "") }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Email</label>
                <input className="w-full md-input"
                        value={editForm.mail}
                        onChange={(e) => setEditForm((s) => ({ ...s, mail: e.target.value }))}/>
                </div>
                <div>
                <label className="text-xs text-gray-600">Empresa</label>
                <select className="w-full md-input"
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
                <button className="md-btn md-btn-outlined"
                        onClick={() => { setEditing(null); setEditForm({ name: "", lastname: "", dni: "", mail: "" }); setEditEmpresaId(""); setMode("list"); }}>
                Cancelar
                </button>
                <button className="md-btn md-btn-filled"
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
