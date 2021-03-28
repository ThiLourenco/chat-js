import { constants } from "./constants.js"

export default class EventManager {
  #allUsers = new Map();

  constructor({ componentEmitter, socketClient }) {
    this.componentEmitter = componentEmitter
    this.socketClient = socketClient
  }

  // entrar na sala já aguardando as messagem a serem recebidas
  joinRoomAndWaitForMessages(data) {
    this.socketClient.sendMessage(constants.events.socket.JOIN_ROOM, data)

    // toda vez que o teminal enviar uma message
    // será disparada o evento para socket da msg
    this.componentEmitter.on(constants.events.app.MESSAGE_SENT, msg => {
      this.socketClient.sendMessage(constants.events.socket.MESSAGE, msg);
    })
  }

  // método para gerenciar todos usuários atualizados na room
  updateUsers(users) {
    const connectedUsers = users
    connectedUsers.forEach(({ id, userName }) => this.#allUsers.set(id, userName));
    this.#updateUsersComponent();
  }

  // método para gerenciar todos os usuários desconectados
  disconnectUser(user) {
    const { userName, id } = user
    this.#allUsers.delete(id)

    this.#updateActivityLogComponent(`${userName} left!`)
    this.#updateUsersComponent()
  }

  // método para gerenciar recebimento de messagem na room
  message(message) {
    this.componentEmitter.emit(
      constants.events.app.MESSAGE_RECEIVED,
      message
    )
  }

  // método para gerenciar quado o user é conectado na room
  newUserConnected(message) {
    const user = message
    this.#allUsers.set(user.id, user.userName)
    this.#updateUsersComponent()
    this.#updateActivityLogComponent(`${user.userName} joined!`)
  }

  //método com gerenciar os logs de atividade
  #updateActivityLogComponent(message) {
    this.#emitComponentUpdate(
      constants.events.app.ACTIVITYLOG_UPDATE,
      message
    )
  }

  #emitComponentUpdate(event, message) {
    this.componentEmitter.emit(
      event,
      message
    )
  }

  // atualização do usuário
  #updateUsersComponent() {
    this.#emitComponentUpdate(
      constants.events.app.STATUS_UPDATE,
      Array.from(this.#allUsers.values())
    )
  }

  // definindo que todas as fns publicas dessa classe serão eventos no socket
  getEvents() {
    const functions = Reflect.ownKeys(EventManager.prototype)
      .filter(fn => fn !== 'constructor')
      .map(name => [name, this[name].bind(this)])

    return new Map(functions);
  }


}
