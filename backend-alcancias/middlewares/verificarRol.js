const verificarAdmin = ( req, res, next ) =>{
    if(req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({
            error: 'Acceso denegado. Se requiere permisos de administrador'
        })
    }
};
module.exports = { verificarAdmin };