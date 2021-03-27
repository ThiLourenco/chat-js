import Events from 'events';
import TerminalController from "./src/terminalController.js";

// componente responsável por trafegar entre a camada controller e outras camadas
const componentEmitter = new Events();

const controller = new TerminalController();
await controller.initializeTable(componentEmitter);




