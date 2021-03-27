import ComponentsBuilder from "./components.js";
import { constants } from "./constants.js";

export default class TerminalController {
  #usersCollors = new Map();
  constructor() {}

  // gerando cores em RGB - (-fg = blessed)
  #pickCollor() {
    return `#` + ((1 << 24) * Math.random() | 0).toString(16) + `-fg`;
    //return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`;
  }

  // gerenciar a cor do usuário no chat de acordo com o nome
  #getUserCollor(userName) {
    if (this.#usersCollors.has(userName))
      return this.#usersCollors.get(userName);

    const collor = this.#pickCollor()
    this.#usersCollors.set(userName, collor)

    return collor;
  }

  // Uma vez que chegou msg, avisará ao backend
  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue()
      console.log(message)
      this.clearValue()
    }
  }

  // event de recebimento msg no chat e renderização na tela
  #onMessageReceived({ screen, chat }) {
    return msg => {
      const { userName, message } = msg;
      const collor = this.#getUserCollor(userName)  // setando a cor no user no chat

      chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`);

      screen.render()
    }
  }

  // event de log dos users
  #onLogChanged({ screen, activityLog }) {
    return msg => {
      // thiago join
      // thiago left

      const [userName] = msg.split(/\s/);
      const collor = this.#getUserCollor(userName)
      activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`);

      screen.render();
    }
  }

  #onStatusChanged({ screen, status}) {
    // array de todos user ['user1', 'user2', ...]
    return users => {

      // vamos pegar o primeiro elemento da lista
      // cada user que entrar, será removido todos os users, e adicionado todos novamente
      const { content } = status.items.shift()
      status.clearItems()
      status.addItem(content)

      users.forEach(userName => {
        const collor = this.#getUserCollor(userName)
        status.addItem(`{${collor}}{bold}${userName}{/}`)
      })

      screen.render()
    }
  }

  // de-para para regristrar os eventos
  #registerEvents(eventsEmitter, components) {
    eventsEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
    eventsEmitter.on(constants.events.app.ACTIVITYLOG_UPDATE, this.#onLogChanged(components))
    eventsEmitter.on(constants.events.app.STATUS_UPDATE, this.#onStatusChanged(components))
  }

  // método para startar todo o projeto, receberá os eventos para gerenciamento, realizando um dê para
  async initializeTable(eventEmitter) {
    const components = new ComponentsBuilder()
      .setScreen({ title: 'YowChat - Thiago' })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter)) // no text area ao digitar adionará a fn que printará na tela a message
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build()

    this.#registerEvents(eventEmitter, components)
    
    components.input.focus() // já executar com focus no input
    components.screen.render() // rederização da tela
  }
}