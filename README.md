# Complementa Senac

## Sobre o projeto

O Complementa Senac é uma plataforma web responsiva projetada para resolver o gargalo burocrático na entrega, controle e validação de horas de atividades complementares na rede Senac. O sistema proporciona autonomia para os alunos e uma gestão eficiente para os coordenadores e administração. Não há necessidade de realizar download ou instalação de aplicativo, pois o sistema é 100% Web.

🔗 **Acesso ao Sistema (Produção):** [https://complementasenac.vercel.app/](https://complementasenac.vercel.app/)

---

## Tecnologias

**Stack Principal:**

* **Frontend:** React (Vite)
* **Backend:** Node.js (Express)
* **Autenticação:** Firebase Auth
* **Banco de Dados:** Cloud Firestore
* **Armazenamento de Arquivos:** Firebase Storage

**Requisitos para rodar:**

* Node.js 18+ (LTS recomendado).
* Conta ativa no Firebase (com Auth, Firestore e Storage habilitados).

---

## Funcionalidades

O sistema atende a três públicos-alvo distintos, cada um com fluxos específicos de navegação:

**👨‍🎓 Alunos:**
* Acompanhamento de progresso individual, separando a carga horária em concluídas, em espera e pendentes (distribuídas pelas áreas de Ensino, Pesquisa e Extensão).


* Submissão de atividades informando dados do evento e carga horária descrita no certificado.


* Upload de comprovantes em formato digital (PDF ou PNG).




**👨‍🏫 Coordenadores:**
* Visualização do dashboard das turmas sob sua responsabilidade para acompanhar o engajamento e as entregas.


* Validação de solicitações pendentes, verificando se a carga horária está dentro dos limites da subcategoria.


* Aprovação ou Reprovação de horas (exigindo justificativa obrigatória em caso de recusa, como "Comprovante ilegível").




**⚙️ SuperAdmin (Administração):**
* Configuração de regras, eixos tecnológicos e parâmetros institucionais para todos os cursos.


* Gerenciamento (Criação, Edição, Remoção) de Alunos, Coordenadores e Cursos.


* Parametrização das travas de aproveitamento (limites de horas por pilar).





---

## Como rodar localmente

Para rodar o projeto em sua máquina para desenvolvimento, siga os passos abaixo:

### Backend

1. Abra um terminal e acesse a pasta da API:
```powershell
cd backend
npm install

```


2. Configure o arquivo `.env` na pasta do backend incluindo o caminho para o `FIREBASE_CREDENTIALS_FILE` (Service Account do Firebase).
3. Inicie o servidor:
```powershell
npm run dev

```


*A API estará disponível em `http://localhost:8080`.*

### Frontend

1. Abra um novo terminal e acesse a pasta da interface:
```powershell
cd frontend
npm install

```


2. Configure o arquivo `.env` na pasta do frontend (certifique-se de que a variável de URL da API aponte para o localhost).
3. Inicie a aplicação:
```powershell
npm run dev

```


*A interface estará rodando em `http://localhost:5173`.*

---

## Estrutura de pastas

| Diretório | Descrição |
| --- | --- |
| `frontend/` | Contém toda a interface do usuário construída em React (Vite) e as configurações de PWA. |
| `backend/` | Contém a API REST em Node.js (Express) responsável pela lógica de negócios e comunicação segura com o Firebase. |

---

## Rotas da aplicação

As rotas da API são protegidas e exigem autenticação via token, exceto a rota de verificação de integridade (health check).

| Método | Rota | Perfil de Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/health` | Público | Verifica se a API está online. |
| GET | `/api/auth/me` | Autenticado | Valida o token e retorna a role (papel) do usuário. |
| GET/POST | `/api/aluno/*` | Aluno | Rotas para submissão e listagem de histórico. |
| GET/POST | `/api/coordenador/*` | Coordenador | Rotas para validação (aprovar/reprovar) fila de atividades. |
| GET/POST/PUT/DELETE | `/api/admin/*` | SuperAdmin | Rotas para gestão completa de usuários e cursos. |

*Nota: Todas as rotas protegidas exigem o cabeçalho `Authorization: Bearer <idToken>`.*

---

## PWA (Progressive Web App)

O frontend foi desenvolvido pensando em mobilidade e inclui um Service Worker via `vite-plugin-pwa`. Em ambiente de produção, a plataforma pode ser "instalada" pelos usuários como um aplicativo standalone diretamente na tela inicial do celular ou desktop (Android, iOS, Windows, macOS), garantindo uma experiência nativa e rápida.

---

## Credenciais de teste

Para testar os fluxos do sistema localmente ou no ambiente de produção, utilize as contas pré-configuradas no banco de dados.
*(Nota para a equipe: Para criar novos usuários no teste, faça login como SuperAdmin).*

* **Padrão de Senha Aluno:** Matrícula do aluno gerada no cadastro.
* **Padrão de Senha Coordenador:** Primeira parte do e-mail + `2026` (Exemplo: se o e-mail for `joao@senac.br`, a senha será `joao2026`).

*(Se necessário, insira aqui um e-mail e senha genéricos de testes que vocês criaram no Firebase para os professores avaliarem o sistema).*

---

## Deploy

O sistema encontra-se integralmente em produção utilizando as seguintes plataformas:

* **Frontend (Interface):** Hospedado na **Vercel** com CI/CD ativado. Atualizações na branch principal refletem automaticamente no link oficial.
* **Backend (API):** Hospedado no **Render**. As variáveis de ambiente (incluindo chaves do Firebase e regras de CORS limitando acessos à Vercel) estão configuradas diretamente no painel do Render.

---

## Dicas para a equipe

* **Segurança:** Nunca façam commit de arquivos `.env` ou do arquivo JSON com as credenciais do Firebase (Service Account) no repositório.
* **CORS:** Sempre que subirem uma alteração de rotas ou domínios novos, lembrem-se de verificar se o domínio de origem está liberado no `CORS_ORIGIN` lá nas variáveis de ambiente do Render.
* **Manutenção Firestore:** As regras de segurança do Firestore devem proibir leitura/escrita pública. Toda operação de gravação das `Solicitações` deve ser validada e autenticada pelo Backend.
* **Trabalho em Squad:** Mantenham a comunicação fluida e realizem *Pull Requests* detalhados em futuras manutenções.

---

## Equipe

Projeto Integrador (PI) do 3º módulo desenvolvido com dedicação pelo squad:

* Abraão Melo
* Fabio Faustino
* Júlio César
* Kauã
* Gabriel Feliciano
* Angelo Mascarenhas
* Rhuan Pietro
