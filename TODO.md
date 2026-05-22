# TODO - Migração do backend (Java -> Node.js)

## Plano aprovado
- Criar backend Node.js em `backend-node/`.
- Manter rotas/JSON iguais às do Spring Boot.
- Rodar na porta 8080.
- Não mexer no frontend.
- Autenticação via Firebase ID token (Authorization Bearer) e mesmo comportamento de 401 apenas em `/api/auth/*`.

## Checklist (andamento)
- [x] Criar estrutura do `backend-node/` (package.json, src/, routes/, services/, middleware/).
- [ ] Implementar autenticação Firebase (middleware) + CORS.
- [ ] Implementar error handler (StandardError).
- [ ] Implementar services: FirestoreService, FileUploadService, PerfilService, FirebaseUserProvisioningService, AlunoService, CoordenadorService, Admin*Service, EmailNotificationService.
- [ ] Implementar controllers/routes: auth, aluno, coordenador, admin (com mesmo contrato de status codes).
- [ ] Configurar env vars (Firebase credentials, storage bucket, mail enabled).
- [ ] Rodar backend Node e testar endpoints principais.
- [ ] Ajustar qualquer diferença de JSON/status até bater com o frontend.

