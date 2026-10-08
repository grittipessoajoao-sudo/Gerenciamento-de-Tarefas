# 📋 Gerenciamento de Tarefas no MongoDB (mongosh)

Este documento contém a resolução completa de todos os exercícios de criação, manipulação, consulta, indexação e agregação de dados no MongoDB utilizando o **mongosh**.

---

## 🛠️ Passo 0: Inicialização e Conexão

1. Abra o terminal (PowerShell ou Prompt de Comando).
2. Conecte-se ao MongoShell:
```bash
mongosh
```

---

## 📂 Exercício 1: Criação de Banco de Dados e Coleção

Criação e seleção do banco de dados `gerenciadorDeTarefas` e criação da coleção `tarefas`:

```javascript
// Seleciona e cria (ao inserir dados) o banco de dados
use gerenciadorDeTarefas;

// Criação explícita da coleção tarefas
db.createCollection("tarefas");
```

---

## ➕ Exercício 2: Inserção de Tarefas (CREATE)

Inserção de três tarefas iniciais na coleção `tarefas`:

```javascript
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
```

---

## 🔍 Exercício 3: Leitura de Tarefas (READ)

Comandos para consulta e filtragem dos dados:

```javascript
// 1. Listar todas as tarefas presentes na coleção
db.tarefas.find();

// 2. Listar apenas as tarefas com status "pendente"
db.tarefas.find({ status: "pendente" });

// 3. Listar tarefas com prioridade "alta", exibindo apenas titulo e dataLimite
db.tarefas.find(
  { prioridade: "alta" },
  { titulo: 1, dataLimite: 1, _id: 0 }
);
```

---

## ✏️ Exercício 4: Atualização de Tarefas (UPDATE)

Comandos para modificação e enriquecimento de documentos:

```javascript
// 1. Atualizar o status da tarefa "Comprar Leite" para "concluída"
db.tarefas.updateOne(
  { titulo: "Comprar Leite" },
  { $set: { status: "concluída" } }
);

// 2. Mudar a prioridade de "Responder E-mails" para "baixa" e adicionar o campo "responsavel"
db.tarefas.updateOne(
  { titulo: "Responder E-mails" },
  { $set: { prioridade: "baixa", responsavel: "Seu Nome" } }
);

// 3. Adicionar uma nova tarefa: "Estudar MongoDB"
db.tarefas.insertOne({
  titulo: "Estudar MongoDB",
  descricao: "Revisar comandos CRUD e agregação",
  status: "pendente",
  prioridade: "alta",
  dataLimite: "2023-11-05"
});

// 4. Atualizar todas as tarefas "pendentes" adicionando o campo tag com o valor "urgente"
db.tarefas.updateMany(
  { status: "pendente" },
  { $set: { tag: "urgente" } }
);
```

---

## 🗑️ Exercício 5: Deletar Tarefas (DELETE)

Comandos para remoção de documentos:

```javascript
// 1. Deletar a tarefa com o título "Comprar Leite"
db.tarefas.deleteOne({ titulo: "Comprar Leite" });

// 2. Deletar todas as tarefas que têm prioridade "baixa"
db.tarefas.deleteMany({ prioridade: "baixa" });
```

---

## 📊 Exercício 6: Consultas Avançadas e Agregação

Operações de agregação, filtros lógicos, ordenação e indexação:

```javascript
// 1. Inserir dados adicionais para os testes
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

// 2. Listar tarefas com status "pendente" OU prioridade "alta"
db.tarefas.find({
  $or: [
    { status: "pendente" },
    { prioridade: "alta" }
  ]
});

// 3. Criar um índice no campo 'dataLimite' para acelerar buscas
db.tarefas.createIndex({ dataLimite: 1 });

// 4. Pipeline de agregação para contar tarefas por status
db.tarefas.aggregate([
  {
    $group: {
      _id: "$status",
      total: { $sum: 1 }
    }
  }
]);

// 5. Encontrar a tarefa pendente mais urgente (menor data limite)
db.tarefas.find({ status: "pendente" })
  .sort({ dataLimite: 1 })
  .limit(1);
```
