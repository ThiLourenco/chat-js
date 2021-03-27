export default class SocketClient {
  #serverConnetion = {}

  constructor({ host, port, protocol }) { // recebendo da cli esses dados
    this.host = host
    this.port = port
    this.protocol = protocol
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
    
    return new Promise(resolve => {
      req.once('upgrade', (res, socket) => resolve(socket)) // once para a promise monitorar apenas um evento
    });
  }

  async initialize() {
    this.#serverConnetion = await this.createConnection()
    console.log('I connection to the server!!');
  }
}
