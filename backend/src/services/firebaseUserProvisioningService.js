const { IllegalArgumentError } = require('../middleware/errorHandler');

class FirebaseUserProvisioningService {
  constructor(admin) {
    this.admin = admin;
  }

  async upsertUser(preferredUid, email, displayName, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = displayName == null ? '' : String(displayName).trim();
    const normalizedPassword = password == null ? '' : String(password).trim();

    if (preferredUid != null && String(preferredUid).trim().length) {
      return await this.upsertByUid(String(preferredUid), normalizedEmail, normalizedName, normalizedPassword);
    }

    const byEmail = await this.findByEmail(normalizedEmail);
    if (byEmail) {
      const update = {
        email: normalizedEmail,
        displayName: normalizedName,
        password: normalizedPassword
      };
      await this.admin.auth().updateUser(byEmail.uid, update);
      return byEmail.uid;
    }

    const create = {
      email: normalizedEmail,
      displayName: normalizedName,
      password: normalizedPassword
    };
    const created = await this.admin.auth().createUser(create);
    return created.uid;
  }

  async deleteByUid(uid) {
    if (!uid || !String(uid).trim()) return;
    try {
      await this.admin.auth().deleteUser(uid);
    } catch (e) {
      // ignore USER_NOT_FOUND
      if (String(e && e.code) !== 'auth/user-not-found') {
        throw new IllegalArgumentError('Falha ao remover usuario do Firebase Auth.');
      }
    }
  }

  async upsertByUid(uid, email, displayName, password) {
    const current = await this.findByUid(uid);
    const byEmail = await this.findByEmail(email);

    if (byEmail && byEmail.uid !== uid) {
      throw new IllegalArgumentError('Ja existe um usuario com este e-mail no Firebase Auth.');
    }

    if (current) {
      await this.admin.auth().updateUser(uid, {
        email,
        displayName,
        password
      });
      return uid;
    }

    const created = await this.admin.auth().createUser({ uid, email, displayName, password });
    return created.uid;
  }

  async findByUid(uid) {
    try {
      return await this.admin.auth().getUser(uid);
    } catch (e) {
      if (String(e && e.code) === 'auth/user-not-found') return null;
      throw e;
    }
  }

  async findByEmail(email) {
    try {
      return await this.admin.auth().getUserByEmail(email);
    } catch (e) {
      if (String(e && e.code) === 'auth/user-not-found') return null;
      throw e;
    }
  }
}

module.exports = FirebaseUserProvisioningService;

