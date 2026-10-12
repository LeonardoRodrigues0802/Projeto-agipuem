import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(DIRETORIO_ATUAL, 'agipuem.db')

# 🔑 DEFINA A SENHA DO ADMINISTRADOR AQUI
SENHA_ADMIN = "admin123" 

def obter_conexao():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def inicializar_banco():
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lista_espera (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL, email TEXT NOT NULL, telefone TEXT NOT NULL, mensagem TEXT,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mural_recados (
            id INTEGER PRIMARY KEY AUTOINCREMENT, autor TEXT NOT NULL, texto TEXT NOT NULL,
            data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agenda_treinos (
            id INTEGER PRIMARY KEY AUTOINCREMENT, modalidade TEXT NOT NULL, data_treino TEXT NOT NULL,
            descricao TEXT NOT NULL, hora_inicio TEXT NOT NULL, hora_fim TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# --------------------------------------------------------------------------
# ROTAS DA API
# --------------------------------------------------------------------------

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    dados = request.json
    if dados and dados.get('senha') == SENHA_ADMIN:
        return jsonify({"status": "sucesso", "token": "token-validado-agipuem"}), 200
    return jsonify({"erro": "Senha incorreta"}), 401

@app.route('/api/lista-espera', methods=['POST', 'OPTIONS'])
def salvar_inscricao():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    dados = request.json
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO lista_espera (nome, email, telefone, mensagem) VALUES (?, ?, ?, ?)',
                   (dados['nome'], dados['email'], dados['telefone'], dados.get('mensagem', '')))
    conn.commit()
    conn.close()
    return jsonify({"status": "sucesso"}), 201

@app.route('/api/mural', methods=['POST', 'OPTIONS'])
def salvar_recado():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    dados = request.json
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO mural_recados (autor, texto) VALUES (?, ?)', (dados['autor'], dados['texto']))
    conn.commit()
    conn.close()
    return jsonify({"status": "sucesso"}), 201

@app.route('/api/mural', methods=['GET'])
def listar_recados():
    conn = obter_conexao()
    cursor = conn.cursor()
    recados = cursor.execute('SELECT autor, texto FROM mural_recados ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([{"autor": r['autor'], "texto": r['texto']} for r in recados]), 200

@app.route('/api/agenda', methods=['POST', 'OPTIONS'])
def salvar_agenda():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    dados = request.json
    
    # Validação de segurança no servidor
    if request.headers.get('Authorization') != 'token-validado-agipuem':
        return jsonify({"erro": "Não autorizado"}), 403
        
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO agenda_treinos (modalidade, data_treino, descricao, hora_inicio, hora_fim) VALUES (?, ?, ?, ?, ?)',
                   (dados['modalidade'], dados['data_treino'], dados['descricao'], dados['hora_inicio'], dados['hora_fim']))
    conn.commit()
    conn.close()
    return jsonify({"status": "sucesso"}), 201

@app.route('/api/agenda', methods=['GET'])
def listar_agenda():
    conn = obter_conexao()
    cursor = conn.cursor()
    linhas = cursor.execute('SELECT modalidade, data_treino, descricao, hora_inicio, hora_fim FROM agenda_treinos').fetchall()
    conn.close()
    return jsonify([{"modalidade": l['modalidade'], "data_treino": l['data_treino'], "descricao": l['descricao'], "hora_inicio": l['hora_inicio'], "hora_fim": l['hora_fim']} for l in linhas]), 200

if __name__ == '__main__':
    inicializar_banco()
    app.run(debug=True, host='127.0.0.1', port=5000)
