export default class Controller {
  #users = new Map();
  constructor({ socketServer }) {
    this.socketServer = socketServer
  }

  // retorna quando uma conexão foi estabilizada
  onNewConnection(socket) {
    const { id } = socket
    console.log('connection stablished with', id)
    const userData = { id, socket }
    this.#updateGlobalUserData(id, userData);

    // delegando cada evento
    socket.on('data', this.#onSocketData(id)) 
    socket.on('error', this.#onSocketClosed(id))
    socket.on('end', this.#onSocketClosed(id))
  }

  // evento de fim conexão do driver do socket
  #onSocketClosed(id) {
    return data => {
      console.log('onSocketClosed', data.toString());
    }
  }

  // será identificado qual o evento que o client deseja receber
  #onSocketData(id) {
    return data => {
      console.log('onSocketData', data.toString());
    }
  }

  // realizar controle global dos users
  #updateGlobalUserData(socketId, userData) {
    const users = this.#users
    const user = users.get(socketId) ?? {}
    
    // atualizar as informaçoes do user conectado
    const updateUserData = {
      ...user,
      ...userData
    }

    users.set(socketId, updateUserData)

    // atualiza os dados do usuário e retorna o obj atualizado
    return users.get(socketId)
  }
}