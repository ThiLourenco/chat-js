import http from 'http';
import { v4 } from 'uuid';
import { constants } from './constants.js';

export default class SocketServer {
  constructor({port}) {
    this.port = port
  }

  // inicializando o server http para utilizar o socket
  async initialize(eventEmitter) {
    const server = http.createServer((req, res) => { 
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end('Hey there!!')  // retorno para testar se a servidor está funcionando
    })

    // upgrade na conexão
    server.on('upgrade', (req, socket) => {
      socket.id = v4()
      const headers = [
        'HTTP/1.1 101 Web Socket Protocol Handshake',
        'Upgrade: WebSocket',
        'Connection: Upgrade',
        ''
      ].map(line => line.concat('\r\n')).join('');  //adicionando quabra de linha no final da string

      socket.write(headers)
      eventEmitter.emit(constants.event.NEW_USER_CONNECTED, socket) // novo usuário conectado
    })

    // caso um erro será rejectado, caso sucesso retornar a instância do server http
    return new Promise((resolve, reject) => {
      server.on('error', reject)
      server.listen(this.port, () => resolve(server))
    })
  }
}