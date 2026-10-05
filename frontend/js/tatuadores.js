const API = 'http://127.0.0.1:8000'
const formTatuador = document.getElementById('form-tatuador')
const botaoSubmit = document.getElementById('btn-submit-tatuador')

function limparFormulario() {
  formTatuador.reset()
  delete formTatuador.dataset.idTatuador
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

async function carregarSenioridades() {
  const resposta = await fetch(`${API}/senioridade`)
  const senioridades = await resposta.json()
  const select = document.getElementById('idsenioridade')
  select.innerHTML = '<option value="">Senioridade...</option>'
  senioridades.forEach(s => {
    select.innerHTML += `<option value="${s.idsenioridade}">${s.nome}</option>`
  })
}

carregarSenioridades()

async function listarTatuadores() {
  const resposta = await fetch(`${API}/tatuadores`)
  const tatuadores = await resposta.json()
  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  tatuadores.forEach(t => {
    corpo.innerHTML += `
      <tr>
        <td>${t.idtatuador}</td>
        <td>${t.nometatuador}</td>
        <td>${t.cpf}</td>
        <td>${t.email ?? '-'}</td>
        <td>${t.telefone ?? '-'}</td>
        <td>${t.senioridade}</td>
        <td>${t.estilos ?? '-'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick='preencherFormularioEdicao(${JSON.stringify(t)})'>Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarTatuador(${t.idtatuador})">Excluir</button>
        </td>
      </tr>`
  })
}

async function carregarEstilos() {
  const resposta = await fetch(`${API}/estilos`);
  const estilos = await resposta.json();

  const div = document.getElementById("listaEstilos");
  div.innerHTML = "";

  estilos.forEach(e => {
    div.innerHTML += `
      <div class="form-check">
        <input class="form-check-input estilo-checkbox"
               type="checkbox"
               value="${e.idestilo}"
               id="estilo-${e.idestilo}">
        <label class="form-check-label" for="estilo-${e.idestilo}">
          ${e.descricao}
        </label>
      </div>
    `;
  });
}

listarTatuadores()
carregarEstilos()

formTatuador.addEventListener('submit', async (e) => {
  e.preventDefault()

  const tatuador = {
    nometatuador: document.getElementById('nometatuador').value,
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value || null,
    telefone: document.getElementById('telefone').value || null,
    datacontratacao: new Date().toISOString().split('T')[0],
    idsenioridade: Number(document.getElementById('idsenioridade').value)
  }

  const idTatuador = formTatuador.dataset.idTatuador

   if (idTatuador) {
    await fetch(`${API}/tatuadores/${idTatuador}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tatuador)
    })

    const estilosSelecionados = Array.from(
      document.querySelectorAll('.estilo-checkbox:checked')
    ).map(cb => Number(cb.value))

    await fetch(`${API}/tatuadores/${idTatuador}/estilos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idestilos: estilosSelecionados })
    })

  } else {
    const resposta = await fetch(`${API}/tatuadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tatuador)
    })

    const dados = await resposta.json()
    const novoId = dados.idtatuador

    const estilosSelecionados = Array.from(
      document.querySelectorAll('.estilo-checkbox:checked')
    ).map(cb => Number(cb.value))

    await fetch(`${API}/tatuadores/${novoId}/estilos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idestilos: estilosSelecionados })
    })
  }

  limparFormulario()
  listarTatuadores()
})

async function preencherFormularioEdicao(tatuador) {
  document.getElementById('nometatuador').value = tatuador.nometatuador
  document.getElementById('cpf').value = tatuador.cpf
  document.getElementById('email').value = tatuador.email || ''
  document.getElementById('telefone').value = tatuador.telefone || ''
  document.getElementById('idsenioridade').value = tatuador.idsenioridade

    const resposta = await fetch(`${API}/tatuadores/${tatuador.idtatuador}/estilos`)
  const estilosDoTatuador = await resposta.json()

  document.querySelectorAll('.estilo-checkbox').forEach(cb => {
    cb.checked = estilosDoTatuador.some(
      e => e.idestilo === Number(cb.value)
    )
  })

  formTatuador.dataset.idTatuador = tatuador.idtatuador
  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

async function deletarTatuador(id) {
  if (!confirm('Tem certeza que deseja excluir este tatuador?')) return

  await fetch(`${API}/tatuadores/${id}`, { method: 'DELETE' })
  listarTatuadores()
}