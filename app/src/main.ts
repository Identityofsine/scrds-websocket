import { BehaviorSubject, catchError, of, skipWhile } from "rxjs";
import { TCPSocket } from "@shared/networking";
import { Socket } from "net";
import { ServerDataAuthPacket, ServerDataExecCommandPacket } from "@shared/packets";

TCPSocket.Instance.setConfig({
  host: '10.2.2.2',
  port: 27015
});

const tcp = TCPSocket.Instance;
const obs = tcp.asObservable()

const connectObserver = obs.pipe(skipWhile((response) => response.event !== 'connect'))
const dataObserver = obs.pipe(skipWhile((response) => response.event !== 'data'))
const errorObserver = obs.pipe(skipWhile((response) => response.event !== 'error'))
const closeObserver = obs.pipe(skipWhile((response) => response.event !== 'close'))

connectObserver.subscribe(({ client, data, event }) => {
  if (event !== 'connect') return;
  if (!client) {
    console.error('No client connected');
    return;
  }
  sendAuthentication(client);
})

dataObserver.subscribe((response) => {
  console.log('Data received:', response.data);
  tcp.send(new ServerDataExecCommandPacket('echo "Hello, World!"').toBytes());
})

errorObserver.subscribe((response) => {
  console.error('Error:', response.error);
})

closeObserver.subscribe(() => {
  console.log('Connection closed');
})

function sendAuthentication(client: Socket) {

  const authPacket = new ServerDataAuthPacket('mimi');
  tcp.send(authPacket.toBytes());

}
