import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config.js';
import { HttpError } from '../../utils/HttpError.js';
import * as repo from './auth.repository.js';

// Cria o JWT
function signToken(user){
    return jwt.sign({sub: user.id}, config.jwtSecret, {expiresIn: config.jwtExpiresIn});
}

function publicUser({password_hash, ...user}){
    return user;
}

export async function register({name, email, password} = {}) {
    name = name?.trim();
    email = email?.trim().toLowerCase();

    if(!name) throw new HttpError(400, 'O nome e obrigatorio', 'name');
    if(!email || !email.includes('@')) throw new HttpError(400, 'Indica um email válido', 'email');
    if(!password || password.length < 8){
        throw new HttpError(400, 'A palavra-passe tem de ter pelo menos 8 caracteres', 'password');
    }

    if(await repo.findByEmail(email)){
        throw new HttpError(409, 'Já existe uma conta com esse email', 'email');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try{
        const user = await repo.insert({name, email, passwordHash});
        return {user, token: signToken(user)};
    } catch (err){
        // 23505 = violação de UNIQUE
        if(err.code === '23505') throw new HttpError(409, 'Já existe uma conta com esse email', 'email');
        throw err;
    }
}

export async function login({email, password} = {}) {
    email = email?.trim().toLowerCase();

    if(!email || !password){
        throw new HttpError(400, 'Indica o email e a palavra-passe', email ? 'password' : 'email');
    }

    const user = await repo.findByEmail(email);
    const ok = user && (await bcrypt.compare(password, user.password_hash));

    if(!ok) throw new HttpError(401, 'Email ou palavra-passe incorretos');

    return {user: publicUser(user), token: signToken(user)};
}

export async function me(userId) {
    const user = await repo.findById(userId);

    // o utilizador pode ter sido apagado entretanto e o token ainda ser valido
    if(!user) throw new HttpError(401, 'Sessao invalida');

    const products = await repo.findProductsOfUser(userId);
    return {user, products};
}