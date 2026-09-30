const express = require('express');
const router = express.Router();
const { crearComunidad, unirseComunidad } = require('../controllers/comunidadController');

router.post('/crear', crearComunidad);
router.post('/unirse', unirseComunidad);

module.exports = router;