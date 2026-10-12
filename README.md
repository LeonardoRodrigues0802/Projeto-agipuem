AGIPUEM - Grupo de Ginástica 🥇

Site oficial e sistema de gestão desportiva do AGIPUEM, desenvolvido com foco em alta performance visual (tema preto e verde turquesa desportivo), integração de backend em Python com Flask e base de dados SQLite.

🚀 Funcionalidades Principais

Agenda Interativa de Treinos:

Grade horária dividida por modalidades: Ginástica Rítmica, G.A. Iniciação, G.A. Treinamento e G.A. Pré-Treino.

Painel administrativo restrito para agendamento de novos treinos em tempo real.

Mural de Recados Público:

Espaço interativo onde visitantes e atletas podem deixar mensagens e recados de incentivo.

Lista de Espera:

Formulário de inscrições para novos interessados fazerem parte das turmas.

Área Administrativa Segura:

Sistema de autenticação protegido por senha (admin123 por padrão) para liberar ferramentas de edição de horários na agenda diretamente pelo frontend.

🛠️ Tecnologias Utilizadas

Backend: Python 3, Flask, Flask-CORS, SQLite3.

Frontend: HTML5, CSS3 (Design Responsivo), JavaScript Moderno (Fetch API).

Hospedagem / Deploy Compatível: Render, Vercel (com Serverless Functions), Netlify (para frontend estático).

📁 Estrutura de Pastas do Projeto

AGIP_UEM/
├── api/
│   └── app.py            # Servidor Flask e rotas da API
├── index.html            # Página principal (Frontend)
├── style.css             # Estilização visual (Dark / Sport Theme)
├── script.js             # Lógica de interação, fetch e controle de abas/admin
├── requirements.txt      # Dependências do Python (Flask, Flask-CORS, etc.)
└── agipuem.db            # Base de dados SQLite (criada automaticamente)


⚙️ Como Executar o Projeto Localmente

1. Pré-requisitos

Certifique-se de ter o Python instalado no seu computador.

2. Clonar o repositório ou abrir a pasta

Abra o terminal na pasta raiz do projeto.

3. Instalar as Dependências

Execute o comando abaixo para instalar o Flask e as extensões necessárias:

pip install -r requirements.txt


4. Executar o Servidor Flask

Inicie a API em Python:

python api/app.py


(O servidor rodará por padrão em http://127.0.0.1:5000)

👤 Autor

Desenvolvido por Leonardo Rodrigues Falcão Malacrida.