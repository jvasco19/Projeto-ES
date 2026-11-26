import { getToken, logout } from "./auth.js";

export class ApiError extends Error {
    constructor(status, message, field = null){
        super(message);
        this.status = status;
        this.field = field;
    }
}

export async function api(path, {method = 'GET', body } = {}) {
    const isForm = body instanceof FormData;
    const headers = {};
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`/api${path}`, {
            method,
            headers,
            body: body === undefined || isForm ? body : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(0, 'Sem ligação ao servidor');
    }

    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok){
        const isAuthForm = path === '/auth/login' || path === '/auth/register';
        if (res.status === 401 && token && !isAuthForm){
            logout();
            window.location.assign('/login');
        }
        throw new ApiError(res.status, data?.error ?? 'Ocorreu um erro', data?.field ?? null);
    }

    return data;
}
