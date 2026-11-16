export function errorHandler(err, req, res, next){
    const status = err.status ?? 500;
    if (status === 500) console.error(err); // erros inesperados, registar na consola
    res.status(status).json({
        error: status === 500 ? 'Erro interno do servidor' : err.message,
        field: err.field ?? null,
    });
}