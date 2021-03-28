import Event from 'events';

// comunicação do socket com o servidor
export default class SocketClient {
  #serverConnection = {}
  #serverListener = new Event();

  constructor({ host, port, protocol }) { // recebendo da cli esses dados
    this.host = host
    this.port = port
    this.protocol = protocol
  }

  // método para envio de messagem
  // comunicação 1 pra 1, client to server
  async sendMessage(event, message) {
    this.#serverConnection.write(JSON.stringify({ event, message }))
  }

  // manipulação de eventos
  attachEvents(events) {
    this.#serverConnection.on('data', data => {
      try {
        data
          .toString()
          .split('\n')
          .filter(line => !!line) // remove todas as linhas vazias
          .map(JSON.parse)
          .map(({ event, message }) => {
            this.#serverListener.emit(event, message)
          })
          
      } catch (error) {
        console.log('invalid', data.toString(), error);
      }
    })

    this.#serverConnection.on('end', () => {
      console.log('I disconnected!!')
    })

    this.#serverConnection.on('error', (error) => {
      console.error('Deu Ruim', error)
    })

    for( const [key, value] of events) {
      // toda vez que chegar um event com essa fn, execute esse valor
      this.#serverListener.on(key, value);
    }
  }

  async createConnection() {
    const options = {
      port: this.port,
      host: this.host,
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket'
      }
    }
  
    const http = await import(this.protocol) // se for http/https importará dinamicamente 
    const req = http.request(options)
    req.end()
    
    // handshake comunicação entre o server e client, aperto de mão
    return new Promise(resolve => {
      req.once('upgrade', (res, socket) => resolve(socket)) // once para a socket monitorar apenas um evento
    });
  }

  async initialize() {
    this.#serverConnection = await this.createConnection()
    console.log('I connection to the server!!');
  }
}
