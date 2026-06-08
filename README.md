# Complementa+ (complementasenac)
#testUserConfig
Sistema academico para gestao de horas complementares do Senac. Alunos submetem atividades com comprovante, coordenadores aprovam ou negam, e administradores gerenciam alunos, coordenadores e cursos.

**Stack:** React (Vite) + Node.js (Express) + Firebase Auth + Firestore + Firebase Storage.

---

## Requisitos

- **Node.js** 18+ (LTS recomendado)
- Conta Firebase com Auth, Firestore e Storage habilitados
- Arquivo JSON de service account do Firebase Admin

---

## Estrutura do projeto

| Pasta | Descricao |
|-------|-----------|
| `frontend/` | Interface React (Vite, PWA) |
| `backend/` | API REST Node.js + Express |

---



## Como rodar localmente

### 1. Backend

```powershell
cd backend
npm install
# Configure backend/.env com FIREBASE_CREDENTIALS_FILE
npm run dev
```

API disponivel em **http://localhost:8080**  
Health check: **http://localhost:8080/api/health**

### 2. Frontend

Em outro terminal:

```powershell
cd frontend
npm install
# Configure frontend/.env
npm run dev
```

Interface em **http://localhost:5173**

---

## Build de producao (sem deploy)

### Frontend

```powershell
cd frontend
npm run build
```

Artefatos em `frontend/dist/`. Sirva estaticamente (Firebase Hosting, Vercel, Netlify, etc.) apontando todas as rotas para `index.html`.

### Backend

```powershell
cd backend
npm install --production
npm start
```

Hospede em Render, Railway, Cloud Run, VPS ou similar. Defina as variaveis de ambiente do backend na plataforma.

---

## Fluxos do sistema

### Login

1. Usuario escolhe perfil (Aluno, Coordenador ou Admin) e informa e-mail/senha.
2. Firebase Auth autentica e retorna ID token.
3. Backend valida token em `GET /api/auth/me` e retorna perfil do Firestore.
4. Frontend redireciona para `/aluno`, `/coordenador` ou `/admin`.

### Aluno

- **Submissao:** `/aluno/submissao` — envia titulo, tipo, data, horas e comprovante (PDF/imagem).
- **Historico:** `/aluno/historico` — lista todas as atividades com status.
- Dados salvos na colecao Firestore `Solicitacoes`; comprovantes no bucket `**********.firebasestorage.app`.

### Coordenador

- Visualiza fila de atividades pendentes.
- **Aprovar** ou **Indeferir** com justificativa (obrigatoria na recusa).
- Link **Visualizar PDF** abre o comprovante enviado pelo aluno.
- Horas aprovadas sao creditadas automaticamente no saldo do aluno.

### Administrador

- **Alunos:** criar, editar e remover (`/gestaoAlunos`). Senha inicial = matricula.
- **Coordenadores:** criar, editar e remover (`/GestaoCoord`). Senha inicial = parte do e-mail + `2026`.
- **Cursos:** criar e listar (`/GestaoCursos`).

---

## Modelo Firestore

| Colecao | Campos principais |
|---------|-------------------|
| `Usuarios` | `uid`, `nome`, `email`, `role`, `vinculo` |
| `Solicitacoes` | `uid_aluno`, `titulo_atividade`, `categoria`, `horas_informadas`, `status`, `url_certificado`, `data_evento` |
| `Cursos` | `id_curso`, `nome_curso`, `eixo_tecnologico` |

Campos em **minusculas com underscore** (`uid_aluno`, `id_curso`, etc.), sem acentos.

---

## API (resumo)

| Metodo | Rota | Perfil |
|--------|------|--------|
| GET | `/api/health` | Publico |
| GET | `/api/auth/me` | Autenticado |
| GET/POST | `/api/aluno/*` | Aluno |
| GET/POST | `/api/coordenador/*` | Coordenador |
| GET/POST/PUT/DELETE | `/api/admin/*` | Admin |

Todas as rotas (exceto `/api/health`) exigem header `Authorization: Bearer <idToken>`.

---

## PWA

O frontend inclui service worker via `vite-plugin-pwa`. Em producao, a aplicacao pode ser instalada como app standalone.

---

## Checklist antes do deploy

- [ ] `backend/.env` configurado na plataforma de hospedagem
- [ ] `frontend/.env` com `VITE_API_BASE` apontando para a URL publica da API
- [ ] `CORS_ORIGIN` no backend com a URL publica do frontend
- [ ] Service account JSON disponivel no servidor (via variavel ou secret)
- [ ] Regras do Firestore e Storage configuradas no Firebase Console
- [ ] Usuarios admin/coordenador/aluno criados no Firestore com `role` correto

---

## Observacao

Projeto academico do Senac. Nao faca commit de arquivos `.env` ou credenciais Firebase.
