// ============================================================================
// Execução Completa da Atividade no MongoDB (mongosh)
// ============================================================================

console.log("\n=======================================================");
console.log("🚀 INICIANDO ATIVIDADE: GERENCIAMENTO DE TAREFAS");
console.log("=======================================================\n");

// ----------------------------------------------------------------------------
// Exercício 1: Criação de Banco de Dados e Coleção
// ----------------------------------------------------------------------------
console.log("📌 [Exercício 1] Selecionando banco 'gerenciadorDeTarefas' e limpando dados anteriores...");
db = db.getSiblingDB("gerenciadorDeTarefas");
db.tarefas.drop(); // Limpa a coleção para execução limpa
db.createCollection("tarefas");
console.log("✅ Banco 'gerenciadorDeTarefas' e coleção 'tarefas' prontos!\n");

// ----------------------------------------------------------------------------
// Exercício 2: Inserção de Tarefas (CREATE)
// ----------------------------------------------------------------------------
console.log("📌 [Exercício 2] Inserindo 3 tarefas iniciais...");
const resInsert = db.tarefas.insertMany([
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
console.log("✅ Tarefas inseridas com sucesso. IDs gerados:");
console.log(resInsert.insertedIds);
console.log("");

// ----------------------------------------------------------------------------
// Exercício 3: Leitura de Tarefas (READ)
// ----------------------------------------------------------------------------
console.log("📌 [Exercício 3.1] Listando todas as tarefas:");
console.log(db.tarefas.find().toArray());

console.log("\n📌 [Exercício 3.2] Listando tarefas com status 'pendente':");
console.log(db.tarefas.find({ status: "pendente" }).toArray());

console.log("\n📌 [Exercício 3.3] Listando tarefas 'alta' com projeção (titulo, dataLimite):");
console.log(db.tarefas.find({ prioridade: "alta" }, { titulo: 1, dataLimite: 1, _id: 0 }).toArray());
console.log("");

// ----------------------------------------------------------------------------
// Exercício 4: Atualização de Tarefas (UPDATE)
// ----------------------------------------------------------------------------
console.log("📌 [Exercício 4.1] Atualizando status de 'Comprar Leite' para 'concluída'...");
db.tarefas.updateOne(
  { titulo: "Comprar Leite" },
  { $set: { status: "concluída" } }
);

console.log("📌 [Exercício 4.2] Alterando prioridade de 'Responder E-mails' para 'baixa' e adicionando 'responsavel'...");
db.tarefas.updateOne(
  { titulo: "Responder E-mails" },
  { $set: { prioridade: "baixa", responsavel: "Dev" } }
);

console.log("📌 [Exercício 4.3] Adicionando nova tarefa 'Estudar MongoDB'...");
db.tarefas.insertOne({
  titulo: "Estudar MongoDB",
  descricao: "Revisar comandos CRUD e agregação",
  status: "pendente",
  prioridade: "alta",
  dataLimite: "2023-11-05"
});

console.log("📌 [Exercício 4.4] Atualizando tarefas 'pendentes' adicionando tag 'urgente'...");
db.tarefas.updateMany(
  { status: "pendente" },
  { $set: { tag: "urgente" } }
);

console.log("✅ Estado das tarefas após atualizações:");
console.log(db.tarefas.find().toArray());
console.log("");

// ----------------------------------------------------------------------------
// Exercício 5: Deletar Tarefas (DELETE)
// ----------------------------------------------------------------------------
console.log("📌 [Exercício 5.1] Deletando a tarefa 'Comprar Leite'...");
db.tarefas.deleteOne({ titulo: "Comprar Leite" });

console.log("📌 [Exercício 5.2] Deletando tarefas com prioridade 'baixa'...");
db.tarefas.deleteMany({ prioridade: "baixa" });

console.log("✅ Tarefas restantes após exclusões:");
console.log(db.tarefas.find().toArray());
console.log("");

// ----------------------------------------------------------------------------
// Exercício 6: Consultas Avançadas e Agregação
// ----------------------------------------------------------------------------
console.log("📌 [Exercício 6.1] Inserindo novas tarefas para agregação...");
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

console.log("\n📌 [Exercício 6.2] Tarefas com status 'pendente' OU prioridade 'alta':");
console.log(db.tarefas.find({
  $or: [
    { status: "pendente" },
    { prioridade: "alta" }
  ]
}).toArray());

console.log("\n📌 [Exercício 6.3] Criando índice no campo 'dataLimite'...");
const indexRes = db.tarefas.createIndex({ dataLimite: 1 });
console.log("Índice criado:", indexRes);

console.log("\n📌 [Exercício 6.4] Agregação: Contagem de tarefas por status:");
const aggRes = db.tarefas.aggregate([
  {
    $group: {
      _id: "$status",
      total: { $sum: 1 }
    }
  }
]).toArray();
console.log(aggRes);

console.log("\n📌 [Exercício 6.5] Tarefa pendente mais urgente (menor dataLimite):");
const maisUrgente = db.tarefas.find({ status: "pendente" })
  .sort({ dataLimite: 1 })
  .limit(1)
  .toArray();
console.log(maisUrgente);

console.log("\n=======================================================");
console.log("🎉 ATIVIDADE EXECUTADA COM SUCESSO!");
console.log("=======================================================\n");
