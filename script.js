const API_URL = "http://localhost:5000/api";


document.addEventListener('DOMContentLoaded', () => {
    let tokenAdmin = localStorage.getItem('agipuem_token') || "";
    if (tokenAdmin) document.body.classList.add('modo-admin-ativo');

    carregarRecadosDoBanco();
    carregarAgendaDoBanco();

    // --- CONTROLE DA JANELA MODAL DE LOGIN ---
    const btnLock = document.getElementById('btn-modo-admin');
    const modalLogin = document.getElementById('modal-login');
    const btnCancelar = document.getElementById('btn-cancelar-login');
    const btnConfirmar = document.getElementById('btn-confirmar-login');
    const senhaInput = document.getElementById('senha-admin-input');

    btnLock.addEventListener('click', () => {
        if (document.body.classList.contains('modo-admin-ativo')) {
            localStorage.removeItem('agipuem_token');
            tokenAdmin = "";
            document.body.classList.remove('modo-admin-ativo');
            alert("Modo Administrador desativado.");
        } else {
            modalLogin.classList.add('open');
            senhaInput.focus();
        }
    });

    btnCancelar.addEventListener('click', () => { modalLogin.classList.remove('open'); senhaInput.value = ""; });

    btnConfirmar.addEventListener('click', () => {
        const senha = senhaInput.value;
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha })
        })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            localStorage.setItem('agipuem_token', data.token);
            tokenAdmin = data.token;
            document.body.classList.add('modo-admin-ativo');
            modalLogin.classList.remove('open');
            senhaInput.value = "";
            alert("Acesso autorizado! Os formulários de calendário estão liberados.");
        })
        .catch(() => { alert("Senha incorreta!"); senhaInput.value = ""; senhaInput.focus(); });
    });

    // --- FORMULÁRIO DE LISTA DE ESPERA (PÚBLICO) ---
    const formContato = document.getElementById('form-contato');
    const mensagemSucesso = document.getElementById('mensagem-sucesso');
    if (formContato) {
        formContato.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const mensagem = document.getElementById('mensagem').value.trim();

            fetch(`${API_URL}/lista-espera`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, telefone, mensagem })
            })
            .then(() => {
                mensagemSucesso.innerText = `Obrigado, ${nome}! Seus dados foram guardados na Lista de Espera.`;
                mensagemSucesso.style.display = 'block';
                formContato.reset();
            });
        });
    }

    // --- SALVAR HORÁRIOS NA AGENDA (RESTRITO AO ADMIN) ---
    const formulariosHorario = document.querySelectorAll('.form-novo-horario');
    formulariosHorario.forEach(formulario => {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            const modalidade = formulario.getAttribute('data-modalidade');
            const dataInput = formulario.querySelector('.input-dias').value;
            const nomeTreino = formulario.querySelector('.input-nome-treino').value.trim();
            const horaInicio = formulario.querySelector('.input-hora-inicio').value;
            const horaFim = formulario.querySelector('.input-hora-fim').value;

            let dataFormatada = "Data não definida";
            if (dataInput) {
                const partes = dataInput.split('-');
                dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }

            fetch(`${API_URL}/agenda`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': tokenAdmin // Passa o token de segurança
                },
                body: JSON.stringify({ modalidade, data_treino: dataFormatada, descricao: nomeTreino, hora_inicio: horaInicio, hora_fim: horaFim })
            })
            .then(res => { if (res.status === 403) throw new Error("Não autorizado"); return res.json(); })
            .then(() => { renderizarItemAgenda(modalidade, dataFormatada, nomeTreino, horaInicio, horaFim); formulario.reset(); })
            .catch(err => alert("Erro: Somente administradores autenticados podem salvar horários."));
        });
    });

    // --- MURAL DE RECADOS (PÚBLICO) ---
    const formRecado = document.getElementById('form-recado');
    const containerRecados = document.getElementById('container-recados');
    if (formRecado && containerRecados) {
        formRecado.addEventListener('submit', (e) => {
            e.preventDefault();
            const autor = document.getElementById('autor-recado').value.trim();
            const texto = document.getElementById('texto-recado').value.trim();

            if (autor && texto) {
                fetch(`${API_URL}/mural`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autor, texto })
                })
                .then(() => { renderizarRecado(autor, texto, true); formRecado.reset(); });
            }
        });
    }

    function renderizarItemAgenda(modalidade, data, descricao, inicio, fim) {
        const containerAlvo = document.querySelector(`#tab-${modalidade} .container-cards-grade`);
        if (containerAlvo) {
            const novoItem = document.createElement('div');
            novoItem.classList.add('item-agenda');
            novoItem.innerHTML = `<div><p class="data-esporte">${data}</p><p class="desc-treino">${descricao}</p></div><small>${inicio} - ${fim}</small>`;
            containerAlvo.appendChild(novoItem);
        }
    }

    function renderizarRecado(autor, texto, topo = false) {
        if (!containerRecados) return;
        const novoRecado = document.createElement('div');
        novoRecado.classList.add('item-recado');
        novoRecado.innerHTML = `<p>"${texto}"</p><span>— ${autor}</span>`;
        if (topo) containerRecados.insertBefore(novoRecado, containerRecados.firstChild);
        else containerRecados.appendChild(novoRecado);
    }

    function carregarRecadosDoBanco() {
        fetch(`${API_URL}/mural`).then(res => res.json()).then(dados => {
            if (containerRecados) { containerRecados.innerHTML = ""; dados.forEach(r => renderizarRecado(r.autor, r.texto)); }
        });
    }

    function carregarAgendaDoBanco() {
        fetch(`${API_URL}/agenda`).then(res => res.json()).then(dados => {
            document.querySelectorAll('.container-cards-grade').forEach(c => c.innerHTML = "");
            dados.forEach(h => renderizarItemAgenda(h.modalidade, h.data_treino, h.descricao, h.hora_inicio, h.hora_fim));
        });
    }

    // Alternar abas da agenda
    const abas = document.querySelectorAll('.tab-btn');
    abas.forEach(a => {
        a.addEventListener('click', () => {
            abas.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            a.classList.add('active');
            document.getElementById(`tab-${a.getAttribute('data-target')}`).classList.add('active');
        });
    });
});
