#!/usr/bin/env node

/*
Prod

hacker-chat \
  --username annon \
  --room sala01 \

  or

./index.js
  --username annon \
  --room sala01 \

-- 

Dev
node index.js \
  --username anoon \
  --room sala01 \
  --hostUri localhost

*/

import Events from 'events';
import CliConfig from './src/cliConfig.js';
import EventManager from './src/eventManager.js';
import SocketClient from './src/socket.js';
import TerminalController from "./src/terminalController.js";

// mapeando os args username, room, e hostUri
const [nodePath, filePath, ...commands] = process.argv
const config = CliConfig.parseArguments(commands);

// componente responsável por trafegar entre a camada 
// controller e outras camadas, gerenciador de eventos
const componentEmitter = new Events();

const socketClient = new SocketClient(config)
await socketClient.initialize()

const eventManager = new EventManager({ componentEmitter, socketClient })
const events = eventManager.getEvents()
socketClient.attachEvents(events)

const data = {
  roomId : config.room,
  userName : config.username
}
eventManager.joinRoomAndWaitForMessages(data);

const controller = new TerminalController();
await controller.initializeTable(componentEmitter);

