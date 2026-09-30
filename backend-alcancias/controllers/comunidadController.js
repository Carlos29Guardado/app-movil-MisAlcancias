const pool = require('../config/db');

const crearComunidad = async (req, res) => {
    const {nombre, emailUsuario, rango_inicio, rango_fin} = req.body;

    //Genera un código aleatorio de 6 caracteres
    const codigoInvitacion = Math.random().toString(36).substring(2,8).toUpperCase();

    try {
        await pool.query('BEGIN');

        //Crear comunidad
        const resultComunidad = await pool.query(
            'INSERT INTO comunidades (nombre, codigo_invitacion, rango_inicio, rango_fin) VALUES ($1, $2, $3, $4) RETURNING id, codigo_invitacion',
            [nombre, codigoInvitacion, rango_inicio, rango_fin]
        );
        const nuevaComunidadId = resultComunidad.rows[0].id;

        //Hacer administrador al creador
        await pool.query(
            "UPDATE usuarios SET comunidad_id = $1, rol = 'admin' WHERE email = $2",
            [nuevaComunidadId, emailUsuario]
        );
        await pool.query('COMMIT'); // Confirma cambios

        res.status(201).json({ 
            mensaje: 'Comunidad creada exitosamente',
            codigo_invitacion: codigoInvitacion,
            comunidad_id: nuevaComunidadId
        });
    } catch (error) {
        await pool.query('ROLLBACK'); // Deshace si hay error
        console.error('Error al crear comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
}
const unirseComunidad = async (req, res) => {
    const { codigo_invitacion, emailUsuario } = req.body; 

    try {
        // Buscar la comunidad por código
        const resultComunidad = await pool.query(
            'SELECT id, nombre FROM comunidades WHERE codigo_invitacion = $1',
            [codigo_invitacion]
        );

        if (resultComunidad.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Código de verificación inválido o no existe.' });
        }

        const comunidadEncontrada = resultComunidad.rows[0];

        // Asignar el usuario a la comunidad como colaborador
        await pool.query(
            "UPDATE usuarios SET comunidad_id = $1, rol = 'colaborador' WHERE email = $2",
            [comunidadEncontrada.id, emailUsuario]
        );

        res.status(200).json({ 
            mensaje: 'Te has unido exitosamente',
            comunidad_id: comunidadEncontrada.id,
            comunidad_nombre: comunidadEncontrada.nombre
        });

    } catch (error) {
        console.error('Error al unirse a la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

module.exports = { crearComunidad, unirseComunidad };