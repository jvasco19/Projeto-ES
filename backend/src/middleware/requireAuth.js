import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from '../utils/HttpError.js';

export function requireAuth(req, res, next){
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if(type !== 'Bearer' || !token){
        throw new HttpError(401, 'Autenticacao necessaria');
    }

    try{
        const payload = jwt.verify(token, config.jwtSecret);
        req.user = {id: Number(payload.sub)};
    } catch {
        throw new HttpError(401, 'Sessao invalida ou expirada');
    }

    next();
}