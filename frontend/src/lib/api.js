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

// Abre um anexo: imagens, PDF e texto num separador novo; outros ficheiros são descarregados.
export async function openAttachment(id, fileName) {
    const win = window.open('', '_blank');
    try {
        const token = getToken();
        const res = await fetch(`/api/attachments/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new ApiError(res.status, data?.error ?? 'Não foi possível abrir o anexo');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const viewable = blob.type.startsWith('image/') || blob.type === 'application/pdf' || blob.type.startsWith('text/');

        if (viewable && win) {
            win.location.href = url;
        } else {
            // DOCX (ou separador bloqueado): descarrega com o nome original
            win?.close();
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
        win?.close();
        throw e;
    }
}