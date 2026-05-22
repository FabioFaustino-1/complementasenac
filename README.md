# Complementa+ (Ruby + Firestore)

Migracao do backend Java/Spring Boot para **Ruby on Rails 8 (API)** com **Firestore** e autenticacao **Firebase**.

## Estrutura

| Componente | Pasta | Porta padrao |
|------------|-------|---------------|
| API Ruby   | `backend` | **8080** (compativel com o frontend) |
| React/Vite | `frontend` | 5173 |

## Requisitos

- Ruby 3.3+ (recomendado)
- Node.js LTS (frontend)
- Credenciais Firebase Admin em `backend/config/firebase/credentials.json`

Copie o JSON do projeto Java:

```powershell
Copy-Item "..\complementasenac\backend\src\main\resources\pi-3-286ed-firebase-adminsdk-fbsvc-d4d68e7e19.json" `
  "backend\config\firebase\credentials.json"
```

## Backend (Rails)

```powershell
cd backend
bundle install

# Subir API (Windows)
.\server.bat

# Se aparecer "EADDRINUSE" / porta 8080 em uso:
.\stop-server.bat
.\server.bat

# Alternativa manual:
# Get-NetTCPConnection -LocalPort 8080 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
# Remove-Item tmp\pids\server.pid -ErrorAction SilentlyContinue
# bundle exec rails server -b 127.0.0.1 -p 8080
```

**Importante:** nao rode o backend Java (`Disk\complementasenac`) e o Ruby ao mesmo tempo — os dois usam a porta **8080**.

A API sobe em **http://localhost:8080**.

### Correcao Firestore (chaves normalizadas)

O banco armazena IDs, campos e valores em formato **minusculo, sem acentos e sem caracteres especiais** (`-`, `_`, `ç`, etc.).

O modulo `FirestoreKeyNormalizer` aplica essa normalizacao em:

- busca de documentos por ID (cursos, usuarios, solicitacoes)
- leitura de campos aninhados (`vinculo`, `saldos`)
- filtros por `status` e `role`
- gravacao de novos registros no mesmo padrao do banco

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Configure `.env` a partir de `.env.example` (Firebase + `VITE_API_BASE=http://localhost:8080`).

## Endpoints principais

- `GET /api/auth/me` — perfil do usuario autenticado
- `GET /api/aluno/*` — aluno
- `GET|POST /api/coordenador/*` — coordenador
- `GET|POST|PUT|DELETE /api/admin/*` — administracao
