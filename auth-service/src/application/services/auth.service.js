const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../domain/entities/user.entity');
const userRepository = require('../../infrastructure/repositories/user.repository');
const eventService = require('../../infrastructure/services/event.service');
const rabbitmqConfig = require('../../infrastructure/config/rabbitmq.config');

class AuthService {
  // Registro de novo usuário
  async register(email, password) {
    const userExists = await userRepository.findByEmail(email);
    if (userExists) throw new Error('E-mail já cadastrado');

    const newUser = new User(null, email, password);
    await newUser.hashPassword();

    const createdUser = await userRepository.create({
      email: newUser.email,
      password: newUser.password,
    });

    await eventService.publishUserCreated(createdUser);
    return this.generateTokens(createdUser);
  }

  // Login de usuário
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      await eventService.publishLoginFailed(email, 'user_not_found');
      throw new Error('Usuário inválido');
    }

    const passwordCorrect = await user.comparePassword(password);
    if (!passwordCorrect) {
      await eventService.publishLoginFailed(email, 'invalid_password');
      throw new Error('Senha incorreta');
    }

    await eventService.publishLoginSuccess(user);
    return this.generateTokens(user);
  }

  // Atualização de perfil
  async updateUser(id, changes) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('Usuário não localizado');

    const updated = await userRepository.update(id, {
      ...user,
      ...changes
    });

    await eventService.publishUserUpdated(updated);
    return updated;
  }

  // Exclusão de usuário
  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('Usuário não localizado');

    await userRepository.delete(id);
    await eventService.publishUserDeleted(user);

    return { message: 'Conta excluída com sucesso' };
  }

  // Solicitação de recuperação de senha
  async initiatePasswordReset(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('E-mail não encontrado');

    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.setRecoveryCode(code);
    await userRepository.update(user.id, user);

    await rabbitmqConfig.sendToQueue('email_queue', {
      type: 'password_reset',
      email: user.email,
      code: code
    });

    await eventService.publishPasswordResetRequested(user);

    return { message: 'Instruções enviadas para o e-mail' };
  }

  // Redefinição de senha
  async applyNewPassword(email, code, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Usuário não localizado');

    if (!user.verifyRecoveryCode(code)) {
      throw new Error('Código inválido ou expirado');
    }

    const newUser = new User(user.id, user.email, newPassword);
    await newUser.hashPassword();

    await userRepository.update(user.id, {
      ...user,
      password: newUser.password,
      recoveryCode: null,
      recoveryCodeExpires: null
    });

    await eventService.publishPasswordChanged(newUser);
    return { message: 'Senha atualizada com sucesso' };
  }

  // Renovação do token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await userRepository.findById(decoded.id);
      if (!user) throw new Error('Token inválido');
      return this.generateTokens(user);
    } catch (err) {
      throw new Error('Erro ao validar token de atualização');
    }
  }

  generateTokens(user) {
    console.log(`[DEBUG] JWT_SECRET: ${process.env.JWT_SECRET}`);
    const access = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refresh = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    console.log(`[DEBUG]`)
    return { accessToken: access, refreshToken: refresh };
  }
}

module.exports = new AuthService();
