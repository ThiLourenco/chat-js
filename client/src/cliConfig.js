const PRODUCTION_URL = 'https://h4ck3r-chat-th.herokuapp.com'

export default class CliConfig {
  constructor({ username, hostUri = PRODUCTION_URL, room }) {
    this.username = username
    this.room = room

    const { hostname, port, protocol } = new URL(hostUri)

    this.host = hostname
    this.port = port
    this.protocol = protocol.replace(/\W/, '') // tudo que não for palavra vai retornar ''.

  }

  static parseArguments(commands) {
    const cmd = new Map()
    
    // pegando o index do comando, se não for commando ignoro, se for o comando pega o index e acresenta + 1 retornado o nome
    for (const key in commands) {
      
      const index = parseInt(key)
      const command = commands[key]

      const commandPreffix = '--'
      if (!command.includes(commandPreffix)) continue;

      cmd.set(
        command.replace(commandPreffix, ''),
        commands[index + 1]
      )
    }
    
    // retornado um obj do Map
    return new CliConfig(Object.fromEntries(cmd));
  }
}