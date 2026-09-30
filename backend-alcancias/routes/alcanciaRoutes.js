const express = require('express');
const router = express.Router();
const { verificarAdmin } = require('../middlewares/verificarRol')
const alcanciaController = require('../controllers/alcanciaController');

router.post('/', alcanciaController.crearAlcancia);
router.get('/comunidad/:comunidad_id', alcanciaController.obtenerAlcancias);
router.put('/:codigo',alcanciaController.actualizarAlcancia)
router.get('/siguiente/:comunidad_id', alcanciaController.obtenerSiguienteAlcancia);


module.exports = router;
