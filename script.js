const tabela = document.querySelector('.tabela-js')

////////////// GET //////////////

axios.get('https://api-mpb.diegosenaisp.repl.co/list').then(function(resposta) {

  console.log(resposta.data);
  getData(resposta.data)
}).catch(function(error) {
  console.log(error)
})


function getData(dados) {
  const categorias = {};
  let totalDespesas = 0;

  dados.forEach((item) => {
    tabela.innerHTML += `
          <tr>
            <th scope="row">${item.STATUS}</th>
            <td>${item.DESPESA}</td>
            <td>${item.VALOR}</td>  
            <td>
              <button class="btn"><span style={{cursor: "pointer"}} class="material-symbols-outlined text-success" onclick="alterarStatus(${item.ID})">check</span></button>
              <button class="btn"><span style={{cursor: "pointer"}} class="material-symbols-outlined text-danger" onclick="excluirDespesa(${item.ID})">delete</span></button>
              <button class="btn"><span style={{cursor: "pointer"}} class="material-symbols-outlined text-success" onclick="atualizarDespesa('${item.DESPESA}', ${item.VALOR})">edit</span></button>
            </td>
          </tr>
      `;

    if (item.STATUS === 'A pagar') {
      // Calcula o total gasto em cada categoria
      if (categorias[item.DESPESA]) {
        categorias[item.DESPESA] += item.VALOR;
      } else {
        categorias[item.DESPESA] = item.VALOR;
      }
    }

    totalDespesas += item.VALOR;
  });
  const saldo = parseFloat(localStorage.getItem('saldo')) || 0;

  // Exibi o saldo na tela
  const meuSaldoContainer = document.getElementById('meuSaldo');
  meuSaldoContainer.innerHTML = `R$: ${saldo}`;

  // Verifica se o total de despesas é maior que o saldo
  if (totalDespesas > saldo) {
    alert('Alerta: O total das despesas é maior que o saldo disponível!');
  }


  // Exibi o total gasto por categoria
  displayTotalPorCategoria(categorias);

}

const saldo = localStorage.getItem('saldo');

// Exibi o saldo na tela
const meuSaldoContainer = document.getElementById('meuSaldo');
meuSaldoContainer.innerHTML = `R$: ${saldo}`

function displayTotalPorCategoria(categorias) {
  // Limpa o conteúdo existente
  const totalPorCategoriaContainer = document.getElementById('totalPorCategoria');
  totalPorCategoriaContainer.innerHTML = '';

  // Cria uma lista para exibir o total por categoria
  const listaTotalPorCategoria = document.createElement('ul');

  // Adiciona cada categoria e seu total à lista
  for (const categoria in categorias) {
    const listItem = document.createElement('li');
    listItem.textContent = `${categoria}: R$ ${categorias[categoria].toFixed(2)}`;
    listaTotalPorCategoria.appendChild(listItem);
  }

  // Adiciona a lista ao contêiner
  totalPorCategoriaContainer.appendChild(listaTotalPorCategoria);
}


////////////// POST //////////////
const addBtn = document.querySelector(".add_modal");

addBtn.addEventListener('click', function(event) {
  event.preventDefault();

  const categoriaInput = document.getElementById("categoria");
  const novaCategoria = categoriaInput.value;
  const valorInput = document.getElementById("valor");
  const novoValor = valorInput.value;

  if (novaCategoria !== "" && novoValor !== "") {
    axios.post('https://api-mpb.diegosenaisp.repl.co/add', { DESPESA: novaCategoria, VALOR: novoValor })
      .then(response => {
        console.log(response.data);
        location.reload()
      })
      .catch(error => {
        console.error('Erro na requisição POST', error);
      });

    categoriaInput.value = "";
    valorInput.value = "";
  } else {
    console.log("Erro: O campo de categoria ou valor está vazio.")
  }
});

////////////// PUT //////////////
function atualizarDespesa(despesaAntiga, valorAntigo) {
  const despesaNova = prompt("Digite a nova categoria:", despesaAntiga);
  const valorNovo = prompt("Digite a nova categoria:", valorAntigo);

  if (despesaNova !== null) {
    axios.put('https://api-mpb.diegosenaisp.repl.co/updateDespesa', {
      "DESPESA_ANTIGA": despesaAntiga,
      "DESPESA_NOVA": despesaNova,
      "VALOR_ANTIGO": valorAntigo,
      "VALOR_NOVO": valorNovo
    })
      .then(function(resposta) {
        tabela.innerHTML = "";
        location.reload()
        getData(resposta.data);

      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

// Alterar Status (PUT)
function alterarStatus(tarefaId) {
  if (confirm(`Deseja realmente alterar o status da despesa com ID ${tarefaId}?`)) {
    axios.put(`https://api-mpb.diegosenaisp.repl.co/updateStatus/${tarefaId}`)
      .then(function(resposta) {

        tabela.innerHTML = "";
        location.reload()
        getData(resposta.data);

      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

////////////// DELETE //////////////
function excluirDespesa(tarefaId) {
  if (confirm(`Deseja realmente excluir a tarefa com ID ${tarefaId}?`)) {
    axios.delete(`https://api-mpb.diegosenaisp.repl.co/delete/${tarefaId}`)
      .then(function(resposta) {
        tabela.innerHTML = "";
        location.reload()
        getData(resposta.data);

      })
      .catch(function(error) {
        console.log(error);
      });
  }
}
const addSaldoBtn = document.querySelector(".addSaldo");

addSaldoBtn.addEventListener('click', function(event) {
  event.preventDefault();

  const saldoInput = document.getElementById("saldo");
  const novoSaldo = parseFloat(saldoInput.value);

  if (!isNaN(novoSaldo)) {
    addSaldo(novoSaldo);
    saldoInput.value = "";
    location.reload()
  } else {
    console.log("Erro: O campo de saldo está vazio ou não é um número válido.")
  }
});

function addSaldo(novoSaldo) {
  localStorage.setItem('saldo', novoSaldo);
  const meuSaldoContainer = document.getElementById('meuSaldo');
  meuSaldoContainer.innerHTML = `R$: ${novoSaldo}`
}