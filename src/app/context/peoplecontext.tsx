'use client';

    import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
    import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    } from 'firebase/firestore';
    import { db } from '@/app/config';
    import type { USER_PROPS, EMPRESA_PROPS } from '@/app/types';


    export interface CreateUserInput {
    name: string;
    lastname: string;
    dni: string;            // viene del form como string
    empresaId?: string;
    mail?: string;          // puede venir vacío
    nationality?: string;
    }
    export interface CreateEmpresaInput {
    nombre: string;
    pais?: string;
    }
    export type UpdateUserPatch = Partial<Omit<USER_PROPS, 'id' | 'tickets'>>;

    // --- helper para NO mandar undefined a Firestore
    function cleanUndefined<T extends Record<string, any>>(obj: T): T {
    const copy: Record<string, any> = {};
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v !== undefined) copy[k] = v; // Firestore no acepta undefined
    }
    return copy as T;
    }

    interface PeopleContextProps {
    users: USER_PROPS[] | null;
    empresas: EMPRESA_PROPS[] | null;
    usersLoading: boolean;
    empresasLoading: boolean;
    lastError: string | null;

    crearUsuario: (data: CreateUserInput) => Promise<string>;
    editarUsuario: (id: string, patch: UpdateUserPatch) => Promise<void>;
    eliminarUsuario: (id: string) => Promise<void>;

    crearEmpresa: (data: CreateEmpresaInput) => Promise<string>;
    editarEmpresa: (id: string, patch: Partial<EMPRESA_PROPS>) => Promise<void>;
    eliminarEmpresa: (id: string) => Promise<void>;
    }

    const PeopleContext = createContext<PeopleContextProps | undefined>(undefined);

    export const usePeople = (): PeopleContextProps => {
    const ctx = useContext(PeopleContext);
    if (!ctx) throw new Error('usePeople debe usarse dentro de <PeopleProvider>');
    return ctx;
    };

    export const PeopleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [users, setUsers] = useState<USER_PROPS[] | null>(null);
    const [empresas, setEmpresas] = useState<EMPRESA_PROPS[] | null>(null);
    const [usersLoading, setUsersLoading] = useState<boolean>(true);
    const [empresasLoading, setEmpresasLoading] = useState<boolean>(true);
    const [lastError, setLastError] = useState<string | null>(null);

    // ---------- Listeners en tiempo real (sin orderBy para evitar índices) ----------
    useEffect(() => {
        const unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
            const raw = snap.docs.map((d) => ({ id: d.id, ...(d.data() as USER_PROPS) }));
            const safe = (v?: string | number) => (v ?? '').toString();
            const sorted = raw.sort((a, b) => {
            const ln = safe(a.lastname).localeCompare(safe(b.lastname), 'es', { sensitivity: 'base' });
            if (ln !== 0) return ln;
            return safe(a.name).localeCompare(safe(b.name), 'es', { sensitivity: 'base' });
            });
            setUsers(sorted);
            setUsersLoading(false);
        },
        (err) => {
            console.error('[PeopleProvider] users onSnapshot error:', err);
            setLastError(String(err));
            setUsersLoading(false);
        }
        );

        const unsubEmpresas = onSnapshot(
        collection(db, 'empresas'),
        (snap) => {
            const raw = snap.docs.map((d) => ({ id: d.id, ...(d.data() as EMPRESA_PROPS) }));
            const sorted = raw.sort((a, b) =>
            (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es', { sensitivity: 'base' })
            );
            setEmpresas(sorted);
            setEmpresasLoading(false);
        },
        (err) => {
            console.error('[PeopleProvider] empresas onSnapshot error:', err);
            setLastError(String(err));
            setEmpresasLoading(false);
        }
        );

        return () => {
        unsubUsers();
        unsubEmpresas();
        };
    }, []);

    // ---------- Helpers ----------
    const findEmpresaNombre = useCallback(
        async (empresaId?: string): Promise<string> => {
        if (!empresaId) return '';
        const cached = empresas?.find((e) => e.id === empresaId);
        if (cached?.nombre) return cached.nombre;
        try {
            const s = await getDoc(doc(db, 'empresas', empresaId));
            if (s.exists()) {
            const e = s.data() as EMPRESA_PROPS;
            return e.nombre || '';
            }
        } catch {
            /* no-op */
        }
        return '';
        },
        [empresas]
    );

    // ---------- Actions: Usuarios ----------
    const crearUsuario = useCallback(
        async (data: CreateUserInput): Promise<string> => {
        try {
            const dniNumber = Number((data.dni || '').replace(/\D/g, '')) || 0;
            const empresaNombre = await findEmpresaNombre(data.empresaId);

            // mail y nationality siempre como string (vacío si no hay)
            const payloadRaw: Omit<USER_PROPS, 'id' | 'tickets'> & {
            createdAt?: any; updatedAt?: any;
            } = {
            name: data.name.trim(),
            lastname: data.lastname.trim(),
            dni: dniNumber,
            mail: (data.mail ?? '').trim(),       // "" si no vino
            nationality: (data.nationality ?? '').trim(),
            originCompany: empresaNombre,         // guardás el nombre de la empresa
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            };

            const payload = cleanUndefined(payloadRaw);

            const ref = await addDoc(collection(db, 'users'), payload);
            return ref.id;
        } catch (e) {
            console.error('[PeopleProvider] crearUsuario error:', e);
            setLastError(String(e));
            throw e;
        }
        },
        [findEmpresaNombre]
    );

    const editarUsuario = useCallback(
        async (id: string, patch: UpdateUserPatch): Promise<void> => {
        try {
            const pRaw: Record<string, any> = { ...patch, updatedAt: serverTimestamp() };
            if (typeof patch.dni === 'string') {
            pRaw.dni = Number(patch.dni.replace(/\D/g, '')) || 0;
            }
            const p = cleanUndefined(pRaw);
            await updateDoc(doc(db, 'users', id), p);
        } catch (e) {
            console.error('[PeopleProvider] editarUsuario error:', e);
            setLastError(String(e));
            throw e;
        }
        },
        []
    );

    const eliminarUsuario = useCallback(
        async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'users', id));
        } catch (e) {
            console.error('[PeopleProvider] eliminarUsuario error:', e);
            setLastError(String(e));
            throw e;
        }
        },
        []
    );

    // ---------- Actions: Empresas ----------
    const crearEmpresa = useCallback(
        async (data: CreateEmpresaInput): Promise<string> => {
        try {
            const payloadRaw: Omit<EMPRESA_PROPS, 'id'> & {
            createdAt?: any; updatedAt?: any;
            } = {
            nombre: data.nombre.trim(),
            pais: (data.pais ?? '').trim(),   // "" si no vino
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            };
            const payload = cleanUndefined(payloadRaw);
            const ref = await addDoc(collection(db, 'empresas'), payload);
            return ref.id;
        } catch (e) {
            console.error('[PeopleProvider] crearEmpresa error:', e);
            setLastError(String(e));
            throw e;
        }
        },
        []
    );

    const editarEmpresa = useCallback(
        async (id: string, patch: Partial<EMPRESA_PROPS>): Promise<void> => {
        try {
            const p = cleanUndefined({ ...patch, updatedAt: serverTimestamp() });
            await updateDoc(doc(db, 'empresas', id), p);
        } catch (e) {
            console.error('[PeopleProvider] editarEmpresa error:', e);
            setLastError(String(e));
            throw e;
        }
        },
        []
    );

    const eliminarEmpresa = useCallback(
        async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'empresas', id));
        } catch (e) {
            console.error('[PeopleProvider] eliminarEmpresa error:', e);
            setLastError(String(e));
            throw e;
        }
        },
        []
    );

    const value: PeopleContextProps = useMemo(
        () => ({
        users,
        empresas,
        usersLoading,
        empresasLoading,
        lastError,
        crearUsuario,
        editarUsuario,
        eliminarUsuario,
        crearEmpresa,
        editarEmpresa,
        eliminarEmpresa,
        }),
        [users, empresas, usersLoading, empresasLoading, lastError, crearUsuario, editarUsuario, eliminarUsuario, crearEmpresa, editarEmpresa, eliminarEmpresa]
    );

    return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
    };
