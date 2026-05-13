# Complementa+ (complementa-senac)

Projeto acadêmico: sistema para alunos registrarem horas complementares, com interface em **React (Vite)** e API em **Java (Spring Boot)**. Autenticação via **Firebase**; o backend valida o token e define perfil (aluno, coordenador ou admin).

---

## O que precisa instalado

- **Node.js** (LTS) — para o frontend  
- **JDK 17** (recomendado para este Spring Boot) — para o backend e para o Maven Wrapper compilar

---

## Java no Windows (PowerShell)

Ver se o compilador e o runtime estão no PATH:

```powershell
where java
where javac
java -version
javac -version
```

Se `javac` não for encontrado, aponte o `JAVA_HOME` para a pasta do JDK (não a JRE) e inclua `bin` no PATH da sessão:

```powershell
$env:JAVA_HOME = "C:\Users\Fábio\Downloads\jdk-17.0.12_windows-x64_bin\jdk-17.0.12"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

(Ajuste o caminho conforme a instalação no seu PC.)

Para persistir entre sessões: *Configurações do Windows → Variáveis de ambiente* e defina `JAVA_HOME` e edite `Path` adicionando `%JAVA_HOME%\bin`.

---

## Como rodar o backend (Spring Boot)

No PowerShell, entre na pasta do backend:

```powershell
cd backend
./mvnw.cmd spring-boot:run

Caso haja algum erro

./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar

```

A API sobe em **http://localhost:8080** (o frontend está configurado para chamar essa URL).

Documentação da API (Swagger/OpenAPI):

- UI: **http://localhost:8080/swagger-ui**
- JSON: **http://localhost:8080/api/docs**

Outros comandos úteis:

```powershell
.\mvnw.cmd compile
.\mvnw.cmd test
```

---

## Como rodar o frontend (React)

Em outro terminal (a partir da pasta `complementasenac`):

```powershell
cd frontend
npm install
npm run dev
```

O Vite costuma abrir em **http://localhost:5173**. Deixe o backend rodando ao mesmo tempo para login e chamadas à API funcionarem.

Build de produção:

```powershell
npm run build
```

PWA:

- O frontend já está configurado com service worker.
- Em produção, a aplicação pode ser instalada no dispositivo (modo standalone).

---

## Configuração de Ambiente (.env)

O projeto utiliza variáveis de ambiente para chaves do Firebase. 
1. Na pasta `frontend`, duplique o arquivo `.env.example`.
2. Renomeie a cópia para `.env`.
3. Preencha os valores com as suas credenciais do Firebase Console.

O arquivo `.env` está no `.gitignore` e nunca deve ser versionado.

### E-mail (backend)

Por padrão, o envio de e-mail está desabilitado e o backend registra o conteúdo em log.
Para habilitar SMTP em deploy, configure no `application.properties`/variáveis:

- `app.mail.enabled=true`
- `app.mail.from=seu-email`
- `spring.mail.host`
- `spring.mail.port`
- `spring.mail.username`
- `spring.mail.password`
- `spring.mail.properties.mail.smtp.auth=true`
- `spring.mail.properties.mail.smtp.starttls.enable=true`

---

## Resumo rápido

| O quê           | Pasta            | Comando principal             |
|-----------------|------------------|--------------------------------|
| API Java        | `backend\backend`| `.\mvnw.cmd spring-boot:run`   |
| Interface React | `frontend`     | `npm run dev`                  |

---

## Observação

Este repositório é um trabalho acadêmico; dados e persistência em memória são simplificados para demonstração.
