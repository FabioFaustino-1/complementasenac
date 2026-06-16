const express = require('express');
const { getMaxHorasPorAtividade } = require('../config/hoursLimit');

const router = express.Router();

router.get('/config/limites', (_req, res) => {
  res.json({ maxHorasPorAtividade: getMaxHorasPorAtividade() });
});

module.exports = router;
