import blessed from 'blessed';

export default class ComponentsBuilder {
  // propriedades
  #screen
  #layout
  #input
  #chat
  #status
  #activityLog

  constructor() {}

  // vai retornar as propriedades para criar os componentes, tendo as propriedades comum em todos os componentes.
  #baseComponent() {
    return {
      border: 'line',
      mouse: true,
      keys: true,
      top: 0,
      scrollbars: {
        ch: ' ',
        inverse: true
      },
      // habilita colocar cores e tags no texto
      tags: true
    }
  }

  // vai receber o título e retornar na tela
  setScreen({ title }) {
    this.#screen = blessed.screen({
      smartCSR: true,   // redimencionamento automático
      title
    });

    // ao apertar esc, q, ou ctrl + c, sairá
    this.#screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

    return this;
  }

  // criação dos quadrados do layout
  setLayoutComponent() {
    this.#layout = blessed.layout({
      parent: this.#screen, // define o pai do layout
      width: '100%',
      height: '100%',
    });

    return this;
  }

  // criação do text area
  setInputComponent(onEnterPressed) { // receberá o event do enter ao pressionado
    const input = blessed.textarea({
      parent: this.#screen,
      bottom: 0,
      height: '10%',
      inputOnFocus: true,
      padding: {
        top: 1,
        left: 2,
      },
      style: {
        fg: '#f6f6f6f6',
        bg: '#3535353'
      }
    });

    input.key('enter', onEnterPressed);
    this.#input = input;

    return this;

  }

  // layout do chat
  setChatComponent() {
    this.#chat = blessed.list({ // recebe tudo que está dentro do baseComponent
      ...this.#baseComponent(),
      parent: this.#layout,
      align: 'left',
      width: '50%',
      height: '90%',
      items: ['{bold}Messenger{/}']  // utilizando a tags do blessed para deixar em negrito

    })

    return this;
  }

  // vai ser reponsável por saber quantos user tem logados
  setStatusComponent() {
    this.#status = blessed.list({
      ...this.#baseComponent(),
      parent: this.#layout,
      width: '25%',
      height: '90%',
      items: ['{bold}Users on Room{/}']
    })

    return this
  }

  // registrar atividade loggin e logoff
  setActivityLogComponent() {
    this.#activityLog = blessed.list({
      ...this.#baseComponent(),
      parent: this.#layout,
      width: '25%',
      height: '90%',
      style: {
        fg: 'yellow'
      },
      items: ['{bold}Activity Log{/}']
    })

    return this
  }

  // responsável por entregar um feature, um objeto que usará na tela
  // o build tá expondo as propriedade para ser exibidas na tela do chat
  build() {
    const components = {
      screen : this.#screen,    
      input : this.#input,
      chat: this.#chat,
      activityLog: this.#activityLog,
      status: this.#status
    }

    return components
  }
}

