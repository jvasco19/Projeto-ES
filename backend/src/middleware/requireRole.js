import { query } from "../db/pool.js";
import { HttpError } from "../utils/HttpError.js";

// allowed recebe as roles que sao permitidas
export function requireRole(...allowed){
    return async (req, res, next) => {
        const productId = Number(req.params.productId);
        if(!Number.isInteger(productId)){
            throw new HttpError(400, 'Produto invalido', 'productId');
        }

        const { rows } = await query(
            'SELECT role FROM product_members WHERE product_id = $1 AND user_id = $2',
            [productId, req.user.id]
        );

        if(!rows[0]) throw new HttpError(404, 'Produto nao encontrado');
        if (!allowed.includes(rows[0].role)) {
            throw new HttpError(403, 'Nao tens permissao para esta acao');
        }

        req.member = { productId, role: rows[0].role };
        next();
    };
}