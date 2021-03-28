export const constants = {
  events: {
    // eventos do component
    app: {
      MESSAGE_SENT: 'message:sent',
      MESSAGE_RECEIVED: 'message:received',
      ACTIVITYLOG_UPDATE: 'activityLog:update',
      STATUS_UPDATE: 'status:update',
    },
    // eventos do socket
    // criando com o mesmo nome das fns do servidor
    // para realizar o de-para
    socket: {
      JOIN_ROOM: 'joinRoom',
      MESSAGE: 'message'
    }
  }
}