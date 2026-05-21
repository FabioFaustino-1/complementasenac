class FileUploadService {
  constructor(admin) {
    this.admin = admin;
    this.bucket = admin.storage().bucket();
  }

  async uploadDataUrl(dataUrl, uidAluno) {
    if (!dataUrl || !String(dataUrl).trim()) return null;
    if (!dataUrl.startsWith('data:')) return dataUrl;

    const split = dataUrl.indexOf(',');
    if (split < 0) throw new Error('Comprovante invalido.');

    const metadata = dataUrl.substring(5, split);
    const base64Content = dataUrl.substring(split + 1);

    const contentType = metadata.includes(';') ? metadata.substring(0, metadata.indexOf(';')) : 'application/octet-stream';
    const extensao = contentType.includes('/') ? contentType.substring(contentType.indexOf('/') + 1) : 'bin';

    const bytes = Buffer.from(base64Content, 'base64');

    const bucketName = await this.resolverBucketExistente();
    const objectName = `solicitacoes/${uidAluno}/${this.uuid()}.${extensao}`;

    const file = this.admin.storage().bucket(bucketName).file(objectName);
    await file.save(bytes, {
      metadata: { contentType }
    });

    return `https://storage.googleapis.com/${bucketName}/${objectName}`;
  }

  async resolverBucketExistente() {
    const configured = process.env.FIREBASE_STORAGE_BUCKET;
    const projectId = this.admin.app.options.projectId;

    const candidatos = [];
    if (configured && configured.trim().length) candidatos.push(configured.trim());
    if (projectId && projectId.trim().length) {
      candidatos.push(`${projectId}.firebasestorage.app`);
      candidatos.push(`${projectId}.appspot.com`);
    }

    // A API Node não tem busca direta 'get bucket list'; tentamos abrir e se falhar, continua.
    for (const nome of candidatos) {
      try {
        const bucket = this.admin.storage().bucket(nome);
        const [exists] = await bucket.exists();
        if (exists) return nome;
      } catch (_) {
        // ignore
      }
    }
    throw new Error('Bucket do Firebase Storage nao encontrado. Configure FIREBASE_STORAGE_BUCKET com um bucket valido.');
  }

  uuid() {
    // bom o suficiente para compatibilidade
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

module.exports = FileUploadService;

