// ============================================================================
// Atividade: Sistema de Gerenciamento de Tarefas com MongoDB (mongosh)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercício 1: Criação de Banco de Dados e Coleção
// ----------------------------------------------------------------------------

// Seleciona ou cria o banco de dados 'gerenciadorDeTarefas'
use gerenciadorDeTarefas;

// Cria explicitamente a coleção 'tarefas'
db.createCollection("tarefas");

// ----------------------------------------------------------------------------
// Exercício 2: Inserção de Tarefas (CREATE)
// ----------------------------------------------------------------------------

// Insere três tarefas iniciais na coleção 'tarefas'
db.tarefas.insertMany([
  {
    titulo: "Comprar Leite",
    descricao: "Leite integral no supermercado",
    status: "pendente",
    prioridade: "alta",
    dataLimite: "2023-10-26"
  },
  {
    titulo: "Preparar Apresentação",
    descricao: "Slides para a reunião de segunda",
    status: "em andamento",
    prioridade: "alta",
    dataLimite: "2023-10-30"
  },
  {
    titulo: "Responder E-mails",
    descricao: "Limpar a caixa de entrada",
    status: "pendente",
    prioridade: "média",
    dataLimite: "2023-10-27"
  }
]);

// ----------------------------------------------------------------------------
// Exercício 3: Leitura de Tarefas (READ)
// ----------------------------------------------------------------------------

// 1. Lista todas as tarefas
db.tarefas.find();

// 2. Lista apenas as tarefas com status 'pendente'
db.tarefas.find({ status: "pendente" });

// 3. Lista tarefas com prioridade 'alta', projetando apenas 'titulo' e 'dataLimite'
db.tarefas.find(
  { prioridade: "alta" },
  { titulo: 1, dataLimite: 1, _id: 0 }
);

// ----------------------------------------------------------------------------
// Exercício 4: Atualização de Tarefas (UPDATE)
// ----------------------------------------------------------------------------

// 1. Atualiza o status de 'Comprar Leite' para 'concluída'
db.tarefas.updateOne(
  { titulo: "Comprar Leite" },
  { $set: { status: "concluída" } }
);

// 2. Atualiza a prioridade de 'Responder E-mails' para 'baixa' e adiciona 'responsavel'
db.tarefas.updateOne(
  { titulo: "Responder E-mails" },
  { $set: { prioridade: "baixa", responsavel: "Seu Nome" } }
);

// 3. Adiciona uma nova tarefa: 'Estudar MongoDB'
db.tarefas.insertOne({
  titulo: "Estudar MongoDB",
  descricao: "Revisar comandos CRUD e agregação",
  status: "pendente",
  prioridade: "alta",
  dataLimite: "2023-11-05"
});

// 4. Atualiza todas as tarefas 'pendentes' adicionando o campo 'tag' como 'urgente'
db.tarefas.updateMany(
  { status: "pendente" },
  { $set: { tag: "urgente" } }
);

// ----------------------------------------------------------------------------
// Exercício 5: Deletar Tarefas (DELETE)
// ----------------------------------------------------------------------------

// 1. Deleta a tarefa com o título 'Comprar Leite'
db.tarefas.deleteOne({ titulo: "Comprar Leite" });

// 2. Deleta todas as tarefas com prioridade 'baixa'
db.tarefas.deleteMany({ prioridade: "baixa" });

// ----------------------------------------------------------------------------
// Exercício 6: Consultas Avançadas e Agregação
// ----------------------------------------------------------------------------

// 1. Insere mais tarefas para testes de agregação e consultas avançadas
db.tarefas.insertMany([
  {
    titulo: "Planejar Viagem",
    descricao: "Pesquisar destinos",
    status: "pendente",
    prioridade: "média",
    dataLimite: "2024-01-15"
  },
  {
    titulo: "Pagar Contas",
    descricao: "Contas de água e luz",
    status: "em andamento",
    prioridade: "alta",
    dataLimite: "2023-10-28"
  },
  {
    titulo: "Fazer Exercício",
    descricao: "Academia ou caminhada",
    status: "pendente",
    prioridade: "baixa",
    dataLimite: "2023-10-26"
  }
]);

// 2. Consulta tarefas com status 'pendente' OU prioridade 'alta'
db.tarefas.find({
  $or: [
    { status: "pendente" },
    { prioridade: "alta" }
  ]
});

// 3. Cria índice no campo 'dataLimite' para otimizar consultas por data
db.tarefas.createIndex({ dataLimite: 1 });

// 4. Agregação: conta a quantidade de tarefas por status
db.tarefas.aggregate([
  {
    $group: {
      _id: "$status",
      total: { $sum: 1 }
    }
  }
]);

// 5. Encontra a tarefa pendente mais urgente (menor dataLimite)
db.tarefas.find({ status: "pendente" })
  .sort({ dataLimite: 1 })
  .limit(1);
