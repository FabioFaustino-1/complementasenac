const express = require('express');
const { getPerfilService } = require('../services/getServices');

const router = express.Router();

router.options('/auth/me', (req, res) => {
  res.status(200).end();
});

router.get('/auth/me', async (req, res, next) => {
  try {
    const uid = req.uid;
    const email = req.email;

    if (!email) {
      return res.status(401).json({ error: 'Token ausente' });
    }

    const perfilService = getPerfilService();
    if (!perfilService) return res.status(500).json({ error: 'Firebase nao inicializado' });

    const perfil = await perfilService.resolverPerfilCompleto(uid, email);
    res.json(perfil);


  } catch (e) {
    next(e);
  }
});


module.exports = router;

