import { constants } from "./constants.js";

export default class Controller {
  // propriedades para gerenciamento de users global e rooms
  #users = new Map();
  #rooms = new Map();

  constructor({ socketServer }) {
    this.socketServer = socketServer
  }

  // método quando uma conexão foi estabilizada
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

  // gerenciar os users na mesma sala
  async joinRoom(socketId, data) {
    const userData = data;
    console.log(`${userData.userName} joined! ${[socketId]}`);
    const { roomId } = userData;
    // atualizando o user ao entrar na room
    const user = this.#updateGlobalUserData(socketId, userData)
    const users = this.#joinUserOnRoom(roomId, user)

    const currentUsers = Array.from(users.values())
      .map(({ id, userName }) => ({ userName, id }))

    // atualiza o usuario que conectou sobre 
    // quais usuarios já estão conectados na mesma sala!
    this.socketServer
      .sendMessage(user.socket, constants.event.UPDATE_USERS, currentUsers);

    // avisa a rede que um novo usuário conectou-se
    this.broadCast({
      socketId,
      roomId,
      message: { id: socketId, userName: userData.userName},
      event: constants.event.NEW_USER_CONNECTED,
    })

  }

  // enviar messagem para todos na room
  broadCast({ socketId, roomId, event, message, includeCurrentSocket = false }) {
    const usersOnRoom = this.#rooms.get(roomId)

    for(const [ key, user ] of usersOnRoom) {
      if (!includeCurrentSocket && key === socketId) continue;

      this.socketServer.sendMessage(user.socket, event, message);
    }
  }

  // recebimento de message
  message(socketId, data) {
    // roomId para enviar msg somente para quem estiver na room
    const { userName, roomId } = this.#users.get(socketId)

    this.broadCast({
      roomId,
      socketId,
      event: constants.event.MESSAGE,
      message: { userName, message: data },
      includeCurrentSocket: true,   // a messagem será enviado para o server da room
    })
  }

  #joinUserOnRoom(roomId, user) { 
    // se nao existir nenhum user na sala, retorna o Map
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map()
    usersOnRoom.set(user.id, user)
    this.#rooms.set(roomId, usersOnRoom)

    return usersOnRoom;
  }

  #logoutUser(id, roomId) {
    this.#users.delete(id)
    const usersOnRoom = this.#rooms.get(roomId)
    usersOnRoom.delete(id)

    this.#rooms.set(roomId, usersOnRoom)
  }

  // gerenciamento de fim conexão do driver do socket
  #onSocketClosed(id) {
    return _ => {
      const { userName, roomId } = this.#users.get(id)
      console.log(userName, 'diconnected', id)
      this.#logoutUser(id, roomId)

      this.broadCast({
        roomId,
        message: { id, userName },
        socketId: id,
        event: constants.event.DISCONNECT_USER,
      })
    }
  }

  // gerenciando o data ao enviar um evento
  #onSocketData(id) {
    return data => {
      try {
        const { event, message } = JSON.parse(data);
        // define qual evento será chamado, e envia a message
        this[event](id, message);
        
      } catch (error) {
        console.error(`wrong event format !!`,error, data.toString());
      }

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