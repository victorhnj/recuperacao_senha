const express = require('express');
const rotas = express.Router();

const controlador = require('../controllers/auth.controller');
const MiddlewareAutenticacao = require('../../infrastructure/middlewares/auth.middleware');


rotas.post('/cadastro', controlador.cadastrar);
rotas.post('/login', controlador.entrar);
rotas.post('/token', controlador.atualizarToken);
rotas.post('/senha/solicitar', controlador.solicitarCodigoRecuperacao);
rotas.post('/senha/redefinir', controlador.redefinirSenha);


rotas.post('/logout', MiddlewareAutenticacao.verificarToken, controlador.sair);

module.exports = rotas;
