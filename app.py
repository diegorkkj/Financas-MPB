from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

try:
  open('Despesas.csv', 'x')
  with open("Despesas.csv", "a", encoding='utf-8') as arquivo:
    arquivo.write("ID,DESPESA,VALOR,STATUS\n")
except Exception as e:
  pass


@app.route("/")
def homepage():
  return ("API ONLINE")


############### GET ########################
@app.route("/list", methods=['GET'])
def listar_despesas():
  despesas_df = pd.read_csv('Despesas.csv')
  despesas = despesas_df.to_dict('records')
  return jsonify(despesas)


############### POST ########################
@app.route("/add", methods=['POST'])
def add_despesa():
  item = request.json
  despesas = pd.read_csv('Despesas.csv')
  despesas = despesas.to_dict('records')
  id = len(despesas) + 1
  status = "A pagar"
  with open("Despesas.csv", "a", encoding='utf-8') as arquivo:
    arquivo.write(f"{id},{item['DESPESA']},{item['VALOR']},{status}\n")
  despesas = pd.read_csv('Despesas.csv')
  despesas = despesas.to_dict('records')
  return jsonify(despesas)


##############################################################

saldo = {'saldo': 0}  # Inicializando o saldo com 0


# Rota para obter o saldo atual
@app.route("/saldo", methods=['GET'])
def get_saldo():
  return jsonify(saldo)


# Rota para adicionar ou atualizar o saldo
@app.route("/addSaldo", methods=['POST', 'PUT'])
def add_saldo():
  if request.method == 'POST':
    data = request.json
    if 'SALDO' in data:
      saldo['valor'] = data['SALDO']
      return jsonify({"message": f"Saldo inicial definido: {saldo['valor']}"})
    else:
      return jsonify({"error": "SALDO não encontrado nos dados enviados"}), 400

  elif request.method == 'PUT':
    data = request.json
    if 'SALDO' in data:
      saldo['valor'] = data['SALDO']
      return jsonify({"message": f"Saldo atualizado: {saldo['valor']}"})
    else:
      return jsonify({"error": "SALDO não encontrado nos dados enviados"}), 400


############### UPDATE ########################
@app.route('/updateDespesa', methods=['PUT'])
def update_despesa():
  data = request.json
  if 'DESPESA_ANTIGA' in data and 'DESPESA_NOVA' in data and 'VALOR_ANTIGO' in data and 'VALOR_NOVO':
    despesa_antiga = data['DESPESA_ANTIGA']
    despesa_nova = data['DESPESA_NOVA']
    valor_antigo = data['VALOR_ANTIGO']
    valor_novo = data['VALOR_NOVO']

    despesas_df = pd.read_csv('Despesas.csv')
    despesas_df.replace(despesa_antiga, despesa_nova, inplace=True, regex=True)
    despesas_df.replace(valor_antigo, valor_novo, inplace=True, regex=True)
    despesas_df.to_csv('Despesas.csv', index=False)
    return jsonify({
        "message":
        f"Despesa alterada: {despesa_antiga} -> {despesa_nova}, Valor alterado: {valor_antigo} -> {valor_novo}"
    })

  return jsonify({"error": "Dados inválidos para atualizar a despesa"})


@app.route('/updateStatus/<int:despesa_id>', methods=['PUT'])
def update_tarefa(despesa_id):
  item = pd.read_csv('Despesas.csv')

  if despesa_id in item["ID"].values:
    status = item.loc[item["ID"] == despesa_id, "STATUS"].values[0]

    novo_status = "Pago" if status == "A pagar" else "A pagar"
    item.loc[item["ID"] == despesa_id, "STATUS"] = novo_status
    item.to_csv('Despesas.csv', index=False)

    return jsonify({"message": "Status alterado."})

  return jsonify({"error": "Ocorreu um erro ao alterar o status."})


############### DELETE ########################
@app.route('/delete/<int:despesa_id>', methods=['DELETE'])
def delete_despesa(despesa_id):
  despesas_df = pd.read_csv('Despesas.csv')
  if despesa_id in despesas_df["ID"].values:
    despesas_df = despesas_df[despesas_df["ID"] != despesa_id]
    despesas_df["ID"] = range(1, len(despesas_df) + 1)
    despesas_df.to_csv('Despesas.csv', index=False)
    return f"Despesa com ID {despesa_id} excluída"
  return f"Despesa com ID {despesa_id} não encontrada"


if __name__ == '__main__':
  app.run(debug=True, host="0.0.0.0")
