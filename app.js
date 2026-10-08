// ============================================================================
// TaskMaster MongoDB - Lógica da Aplicação Web e Simulação MongoShell
// ============================================================================

// Estado Global da Aplicação
const appState = {
  tarefas: [],
  visaoCompacta: false,
  filtroStatus: "todos",
  filtroPrioridade: "todas",
  buscaTexto: ""
};

// ----------------------------------------------------------------------------
// Inicialização da Aplicação
// ----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  carregarTarefasIniciais();
  inicializarEventos();
  renderizarAplicacao();
  logTerminal("// Banco 'gerenciadorDeTarefas' pronto. Digite comandos ou use os botões.");
});

// Carrega dados salvos no localStorage ou cria lista inicial padrão
function carregarTarefasIniciais() {
  const salvo = localStorage.getItem("mongodb_tarefas");
  if (salvo) {
    try {
      appState.tarefas = JSON.parse(salvo);
    } catch {
      appState.tarefas = [];
    }
  } else {
    executarExercicio2(false);
  }
}

// Salva o estado atual no LocalStorage
function persistirTarefas() {
  localStorage.setItem("mongodb_tarefas", JSON.stringify(appState.tarefas));
}

// ----------------------------------------------------------------------------
// Configuração dos Ouvintes de Eventos
// ----------------------------------------------------------------------------
function inicializarEventos() {
  // Abertura e fechamento de modais
  document.getElementById("btn-nova-tarefa").addEventListener("click", () => abrirModalTarefa());
  document.getElementById("btn-fechar-modal").addEventListener("click", fecharModalTarefa);
  document.getElementById("btn-cancelar-modal").addEventListener("click", fecharModalTarefa);
  document.getElementById("form-tarefa").addEventListener("submit", salvarFormularioTarefa);

  // Modal de Exercícios
  document.getElementById("btn-guia-exercicios").addEventListener("click", () => abrirModalExercicios());
  document.getElementById("btn-fechar-exercicios").addEventListener("click", fecharModalExercicios);

  // Botões dos Exercícios 1 ao 6
  document.getElementById("btn-ex1").addEventListener("click", () => executarExercicio1());
  document.getElementById("btn-ex2").addEventListener("click", () => executarExercicio2(true));
  document.getElementById("btn-ex3").addEventListener("click", () => executarExercicio3());
  document.getElementById("btn-ex4").addEventListener("click", () => executarExercicio4());
  document.getElementById("btn-ex5").addEventListener("click", () => executarExercicio5());
  document.getElementById("btn-ex6").addEventListener("click", () => executarExercicio6());
  document.getElementById("btn-executar-todos").addEventListener("click", () => executarTodosExercicios());

  // Terminal mongosh drawer
  document.getElementById("btn-toggle-terminal").addEventListener("click", toggleTerminal);
  document.getElementById("btn-fechar-terminal").addEventListener("click", toggleTerminal);
  document.getElementById("btn-limpar-terminal").addEventListener("click", limparTerminal);
  document.getElementById("btn-enviar-terminal").addEventListener("click", processarInputTerminal);
  document.getElementById("terminal-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") processarInputTerminal();
  });

  // Filtros e Visualização
  document.getElementById("input-busca").addEventListener("input", (e) => {
    appState.buscaTexto = e.target.value.toLowerCase();
    renderizarTarefas();
  });

  document.getElementById("filtro-status").addEventListener("change", (e) => {
    appState.filtroStatus = e.target.value;
    renderizarTarefas();
  });

  document.getElementById("filtro-prioridade").addEventListener("change", (e) => {
    appState.filtroPrioridade = e.target.value;
    renderizarTarefas();
  });

  document.getElementById("btn-toggle-view").addEventListener("click", alternarModoVisualizacao);
  document.getElementById("btn-seed-empty")?.addEventListener("click", () => executarExercicio2(true));
}

// ----------------------------------------------------------------------------
// Renderização Completa da Interface
// ----------------------------------------------------------------------------
function renderizarAplicacao() {
  renderizarTarefas();
  atualizarMetricasAgregacao();
}

// Renderiza a lista de tarefas aplicando filtros
function renderizarTarefas() {
  const container = document.getElementById("tasks-container");
  const emptyState = document.getElementById("empty-state");
  const tarefasFiltradas = filtrarTarefas();

  container.innerHTML = "";
  document.getElementById("counter-tarefas").textContent = `${tarefasFiltradas.length} itens exibidos`;

  if (tarefasFiltradas.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    tarefasFiltradas.forEach(tarefa => {
      container.appendChild(criarCardTarefa(tarefa));
    });
  }
}

// Filtra as tarefas de acordo com os filtros selecionados
function filtrarTarefas() {
  return appState.tarefas.filter(t => {
    const matchStatus = appState.filtroStatus === "todos" || t.status === appState.filtroStatus;
    const matchPrioridade = appState.filtroPrioridade === "todas" || t.prioridade === appState.filtroPrioridade;
    const matchBusca = !appState.buscaTexto || 
      t.titulo.toLowerCase().includes(appState.buscaTexto) ||
      (t.descricao && t.descricao.toLowerCase().includes(appState.buscaTexto)) ||
      (t.tag && t.tag.toLowerCase().includes(appState.buscaTexto));
    return matchStatus && matchPrioridade && matchBusca;
  });
}

// Cria o elemento HTML de um card de tarefa
function criarCardTarefa(tarefa) {
  const card = document.createElement("article");
  card.className = `task-card prioridade-${tarefa.prioridade}`;
  card.id = `task-${tarefa._id}`;

  const isConcluida = tarefa.status === "concluída";
  const tagHtml = tarefa.tag ? `<span class="badge badge-tag">#${tarefa.tag}</span>` : "";
  const respHtml = tarefa.responsavel ? `<span class="meta-item meta-responsavel">👤 ${tarefa.responsavel}</span>` : "";

  card.innerHTML = `
    <div class="task-header">
      <h3 class="task-title ${isConcluida ? 'completed' : ''}">${tarefa.titulo}</h3>
      <div class="task-badges">
        <span class="badge badge-${tarefa.status.replace(' ', '')}">${tarefa.status}</span>
        ${tagHtml}
      </div>
    </div>
    <p class="task-desc">${tarefa.descricao || "Sem descrição informada."}</p>
    <div class="task-meta">
      <div class="meta-row">
        <span class="meta-item">📅 Limite: <strong class="meta-date">${tarefa.dataLimite}</strong></span>
        ${respHtml}
      </div>
    </div>
    <div class="task-actions">
      <button class="btn btn-sm ${isConcluida ? 'btn-secondary' : 'btn-outline'}" onclick="alternarStatusTarefa('${tarefa._id}')">
        ${isConcluida ? '↩ Reabrir' : '✔ Concluir'}
      </button>
      <div class="task-btn-group">
        <button class="btn btn-sm btn-secondary" onclick="editarTarefa('${tarefa._id}')" title="Editar">✏</button>
        <button class="btn btn-sm btn-secondary" onclick="removerTarefa('${tarefa._id}')" title="Deletar">🗑</button>
      </div>
    </div>
  `;
  return card;
}

// ----------------------------------------------------------------------------
// Agregação e Métricas ($group, $sort, $limit)
// ----------------------------------------------------------------------------
function atualizarMetricasAgregacao() {
  const total = appState.tarefas.length;
  const pendentes = appState.tarefas.filter(t => t.status === "pendente").length;
  const andamento = appState.tarefas.filter(t => t.status === "em andamento").length;
  const concluidas = appState.tarefas.filter(t => t.status === "concluída").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-pendentes").textContent = pendentes;
  document.getElementById("stat-andamento").textContent = andamento;
  document.getElementById("stat-concluidas").textContent = concluidas;

  // Localiza a tarefa pendente mais urgente (menor dataLimite)
  const pendentesOrdenadas = [...appState.tarefas]
    .filter(t => t.status === "pendente")
    .sort((a, b) => a.dataLimite.localeCompare(b.dataLimite));

  const maisUrgente = pendentesOrdenadas[0];
  const elTitulo = document.getElementById("stat-urgente-titulo");
  const elData = document.getElementById("stat-urgente-data");

  if (maisUrgente) {
    elTitulo.textContent = maisUrgente.titulo;
    elData.textContent = `Data: ${maisUrgente.dataLimite}`;
  } else {
    elTitulo.textContent = "Nenhuma pendente";
    elData.textContent = "-";
  }
}

// Alterna o modo de visualização entre completo e compacto (Projeção)
function alternarModoVisualizacao() {
  appState.visaoCompacta = !appState.visaoCompacta;
  const container = document.getElementById("tasks-container");
  const label = document.getElementById("label-view-mode");

  if (appState.visaoCompacta) {
    container.classList.add("compact-view");
    label.textContent = "Projeção (Título + Data)";
    logTerminal("db.tarefas.find({}, { titulo: 1, dataLimite: 1, _id: 0 })");
  } else {
    container.classList.remove("compact-view");
    label.textContent = "Visão Completa";
    logTerminal("db.tarefas.find()");
  }
}

// ----------------------------------------------------------------------------
// Operações CRUD do Formulário
// ----------------------------------------------------------------------------
function abrirModalTarefa(tarefa = null) {
  const modal = document.getElementById("modal-tarefa");
  const tituloModal = document.getElementById("modal-titulo");
  const form = document.getElementById("form-tarefa");

  form.reset();
  if (tarefa) {
    tituloModal.textContent = "Editar Tarefa";
    document.getElementById("tarefa-id").value = tarefa._id;
    document.getElementById("form-titulo").value = tarefa.titulo;
    document.getElementById("form-descricao").value = tarefa.descricao || "";
    document.getElementById("form-status").value = tarefa.status;
    document.getElementById("form-prioridade").value = tarefa.prioridade;
    document.getElementById("form-data").value = tarefa.dataLimite;
    document.getElementById("form-responsavel").value = tarefa.responsavel || "";
    document.getElementById("form-tag").value = tarefa.tag || "";
  } else {
    tituloModal.textContent = "Adicionar Nova Tarefa";
    document.getElementById("tarefa-id").value = "";
    document.getElementById("form-data").value = new Date().toISOString().split("T")[0];
  }

  modal.classList.remove("hidden");
}

function fecharModalTarefa() {
  document.getElementById("modal-tarefa").classList.add("hidden");
}

function salvarFormularioTarefa(e) {
  e.preventDefault();
  const id = document.getElementById("tarefa-id").value;
  const dados = {
    titulo: document.getElementById("form-titulo").value.trim(),
    descricao: document.getElementById("form-descricao").value.trim(),
    status: document.getElementById("form-status").value,
    prioridade: document.getElementById("form-prioridade").value,
    dataLimite: document.getElementById("form-data").value,
    responsavel: document.getElementById("form-responsavel").value.trim() || undefined,
    tag: document.getElementById("form-tag").value.trim() || undefined
  };

  if (id) {
    atualizarTarefa(id, dados);
    mostrarToast("Tarefa atualizada com sucesso!", "success");
  } else {
    inserirTarefa(dados);
    mostrarToast("Tarefa criada com sucesso!", "success");
  }

  fecharModalTarefa();
  renderizarAplicacao();
}

function inserirTarefa(dados) {
  const nova = {
    _id: "obj_" + Date.now().toString(16),
    ...dados
  };
  appState.tarefas.push(nova);
  persistirTarefas();
  logTerminal(`db.tarefas.insertOne(${JSON.stringify(nova, null, 2)})`);
}

function atualizarTarefa(id, updates) {
  const idx = appState.tarefas.findIndex(t => t._id === id);
  if (idx !== -1) {
    appState.tarefas[idx] = { ...appState.tarefas[idx], ...updates };
    persistirTarefas();
    logTerminal(`db.tarefas.updateOne({ _id: ObjectId("${id}") }, { $set: ${JSON.stringify(updates)} })`);
  }
}

function alternarStatusTarefa(id) {
  const t = appState.tarefas.find(item => item._id === id);
  if (!t) return;
  const novoStatus = t.status === "concluída" ? "pendente" : "concluída";
  atualizarTarefa(id, { status: novoStatus });
  renderizarAplicacao();
  mostrarToast(`Status alterado para "${novoStatus}"`, "info");
}

function editarTarefa(id) {
  const t = appState.tarefas.find(item => item._id === id);
  if (t) abrirModalTarefa(t);
}

function removerTarefa(id) {
  const t = appState.tarefas.find(item => item._id === id);
  if (!t) return;
  appState.tarefas = appState.tarefas.filter(item => item._id !== id);
  persistirTarefas();
  renderizarAplicacao();
  logTerminal(`db.tarefas.deleteOne({ _id: ObjectId("${id}") })`);
  mostrarToast(`Tarefa "${t.titulo}" deletada!`, "warning");
}

// ----------------------------------------------------------------------------
// Execução dos Exercícios MongoDB (1 ao 6)
// ----------------------------------------------------------------------------
function abrirModalExercicios() {
  document.getElementById("modal-exercicios").classList.remove("hidden");
}

function fecharModalExercicios() {
  document.getElementById("modal-exercicios").classList.add("hidden");
}

// Exercício 1: Criação de Banco de Dados e Coleção
function executarExercicio1() {
  logTerminal("// [Exercício 1] Criação de Banco de Dados e Coleção");
  logTerminal("use gerenciadorDeTarefas");
  logTerminal('db.createCollection("tarefas")');
  mostrarToast("Banco 'gerenciadorDeTarefas' e coleção 'tarefas' criados!", "success");
}

// Exercício 2: Inserção de Tarefas (CREATE)
function executarExercicio2(comToast = true) {
  logTerminal("// [Exercício 2] Inserção de 3 Tarefas Iniciais (CREATE)");
  const iniciais = [
    {
      _id: "6ac78286923a428714cb0ce2",
      titulo: "Comprar Leite",
      descricao: "Leite integral no supermercado",
      status: "pendente",
      prioridade: "alta",
      dataLimite: "2023-10-26"
    },
    {
      _id: "6ac78286923a428714cb0ce3",
      titulo: "Preparar Apresentação",
      descricao: "Slides para a reunião de segunda",
      status: "em andamento",
      prioridade: "alta",
      dataLimite: "2023-10-30"
    },
    {
      _id: "6ac78286923a428714cb0ce4",
      titulo: "Responder E-mails",
      descricao: "Limpar a caixa de entrada",
      status: "pendente",
      prioridade: "média",
      dataLimite: "2023-10-27"
    }
  ];

  appState.tarefas = [...iniciais];
  persistirTarefas();
  renderizarAplicacao();

  logTerminal(`db.tarefas.insertMany(${JSON.stringify(iniciais, null, 2)})`);
  if (comToast) mostrarToast("3 Tarefas iniciais inseridas com sucesso!", "success");
}

// Exercício 3: Leitura de Tarefas (READ)
function executarExercicio3() {
  logTerminal("// [Exercício 3] Consultas READ com Projeção");
  logTerminal("1) db.tarefas.find()");
  logTerminal('2) db.tarefas.find({ status: "pendente" })');
  logTerminal('3) db.tarefas.find({ prioridade: "alta" }, { titulo: 1, dataLimite: 1, _id: 0 })');

  document.getElementById("filtro-status").value = "pendente";
  appState.filtroStatus = "pendente";
  renderizarTarefas();
  mostrarToast("Filtro 'pendente' aplicado para demonstração do Ex. 3", "info");
}

// Exercício 4: Atualização de Tarefas (UPDATE)
function executarExercicio4() {
  logTerminal("// [Exercício 4] Atualizações UPDATE");

  // 1. Atualiza "Comprar Leite" -> "concluída"
  const leite = appState.tarefas.find(t => t.titulo === "Comprar Leite");
  if (leite) leite.status = "concluída";

  // 2. "Responder E-mails" -> "baixa" + "responsavel"
  const emails = appState.tarefas.find(t => t.titulo === "Responder E-mails");
  if (emails) {
    emails.prioridade = "baixa";
    emails.responsavel = "Seu Nome";
  }

  // 3. Adiciona "Estudar MongoDB" se não existir
  if (!appState.tarefas.some(t => t.titulo === "Estudar MongoDB")) {
    appState.tarefas.push({
      _id: "6ac78286923a428714cb0ce5",
      titulo: "Estudar MongoDB",
      descricao: "Revisar comandos CRUD e agregação",
      status: "pendente",
      prioridade: "alta",
      dataLimite: "2023-11-05"
    });
  }

  // 4. Tag "urgente" em todas as pendentes
  appState.tarefas.forEach(t => {
    if (t.status === "pendente") t.tag = "urgente";
  });

  persistirTarefas();
  document.getElementById("filtro-status").value = "todos";
  appState.filtroStatus = "todos";
  renderizarAplicacao();

  logTerminal('db.tarefas.updateOne({ titulo: "Comprar Leite" }, { $set: { status: "concluída" } })');
  logTerminal('db.tarefas.updateOne({ titulo: "Responder E-mails" }, { $set: { prioridade: "baixa", responsavel: "Seu Nome" } })');
  logTerminal('db.tarefas.updateMany({ status: "pendente" }, { $set: { tag: "urgente" } })');
  mostrarToast("Exercício 4 executado: tarefas atualizadas e marcadas com 'urgente'!", "success");
}

// Exercício 5: Deletar Tarefas (DELETE)
function executarExercicio5() {
  logTerminal("// [Exercício 5] Remoções DELETE");
  logTerminal('db.tarefas.deleteOne({ titulo: "Comprar Leite" })');
  logTerminal('db.tarefas.deleteMany({ prioridade: "baixa" })');

  appState.tarefas = appState.tarefas.filter(t => t.titulo !== "Comprar Leite" && t.prioridade !== "baixa");
  persistirTarefas();
  renderizarAplicacao();
  mostrarToast("Exercício 5 executado: tarefa 'Comprar Leite' e tarefas de prioridade 'baixa' deletadas!", "warning");
}

// Exercício 6: Consultas Avançadas e Agregação
function executarExercicio6() {
  logTerminal("// [Exercício 6] Consultas Avançadas, Agregação e Índices");

  // Insere dados extras para agregação
  const extras = [
    {
      _id: "6ac78286923a428714cb0ce6",
      titulo: "Planejar Viagem",
      descricao: "Pesquisar destinos",
      status: "pendente",
      prioridade: "média",
      dataLimite: "2024-01-15"
    },
    {
      _id: "6ac78286923a428714cb0ce7",
      titulo: "Pagar Contas",
      descricao: "Contas de água e luz",
      status: "em andamento",
      prioridade: "alta",
      dataLimite: "2023-10-28"
    },
    {
      _id: "6ac78286923a428714cb0ce8",
      titulo: "Fazer Exercício",
      descricao: "Academia ou caminhada",
      status: "pendente",
      prioridade: "baixa",
      dataLimite: "2023-10-26"
    }
  ];

  extras.forEach(item => {
    if (!appState.tarefas.some(t => t.titulo === item.titulo)) {
      appState.tarefas.push(item);
    }
  });

  persistirTarefas();
  renderizarAplicacao();

  logTerminal('1) db.tarefas.find({ $or: [ { status: "pendente" }, { prioridade: "alta" } ] })');
  logTerminal("2) db.tarefas.createIndex({ dataLimite: 1 })");
  logTerminal('3) db.tarefas.aggregate([ { $group: { _id: "$status", total: { $sum: 1 } } } ])');
  logTerminal('4) db.tarefas.find({ status: "pendente" }).sort({ dataLimite: 1 }).limit(1)');
  mostrarToast("Exercício 6 executado com sucesso: dados extras, agregação e tarefa mais urgente!", "success");
}

// Executa todo o pipeline de exercícios do 1 ao 6
function executarTodosExercicios() {
  executarExercicio1();
  executarExercicio2(false);
  executarExercicio4();
  executarExercicio5();
  executarExercicio6();
  fecharModalExercicios();
  mostrarToast("Todos os exercícios de 1 a 6 foram executados com sucesso!", "success");
}

// ----------------------------------------------------------------------------
// Terminal mongosh Integrado
// ----------------------------------------------------------------------------
function toggleTerminal() {
  const drawer = document.getElementById("terminal-drawer");
  drawer.classList.toggle("hidden");
}

function logTerminal(texto) {
  const out = document.getElementById("terminal-output");
  const line = document.createElement("div");
  line.className = "terminal-line";

  if (texto.startsWith("db.") || texto.startsWith("use ")) {
    line.className += " terminal-cmd";
    line.textContent = "> " + texto;
  } else {
    line.textContent = texto;
  }

  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function limparTerminal() {
  document.getElementById("terminal-output").innerHTML = "";
  logTerminal("// Terminal mongosh limpo.");
}

function processarInputTerminal() {
  const input = document.getElementById("terminal-input");
  const cmd = input.value.trim();
  if (!cmd) return;

  logTerminal(cmd);
  input.value = "";

  if (cmd === "db.tarefas.find()") {
    logTerminal(JSON.stringify(appState.tarefas, null, 2));
  } else if (cmd.includes("aggregate")) {
    const res = [
      { _id: "pendente", total: appState.tarefas.filter(t => t.status === "pendente").length },
      { _id: "em andamento", total: appState.tarefas.filter(t => t.status === "em andamento").length },
      { _id: "concluída", total: appState.tarefas.filter(t => t.status === "concluída").length }
    ];
    logTerminal(JSON.stringify(res, null, 2));
  } else {
    logTerminal(`{ acknowledged: true, msg: "Comando executado no banco 'gerenciadorDeTarefas'" }`);
  }
}

// ----------------------------------------------------------------------------
// Sistema de Toasts / Notificações
// ----------------------------------------------------------------------------
function mostrarToast(mensagem, tipo = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  const icones = { success: "✅", info: "ℹ️", warning: "⚠️" };
  toast.innerHTML = `<span>${icones[tipo] || 'ℹ️'}</span> <span>${mensagem}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
