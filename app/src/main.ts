import { ServerDataAuthPacket, ServerDataExecCommandPacket } from "@shared/packets";
import * as net from "net";
import { BehaviorSubject, catchError, of } from "rxjs";

const bytes = new ServerDataAuthPacket("mimi").toBytes();
// print out all of the bytes in the array
const byteArray = new Uint8Array(bytes);
console.log("Packet Bytes:", byteArray);

const connectionObservable = new BehaviorSubject<{ data: any, client?: net.Socket } | null>({
  data: null,
});

// simple tcp socket client
const client = new net.Socket();
client.connect(
  {
    host: "10.2.2.2",
    port: 27015,
  },
  () => connectionObservable.next({
    data: "Connected to server",
    client,
  })
);
client.on("connect", () => {
  client.write(byteArray, (err) => {
    if (err) {
      connectionObservable.next({
        data: err,
        client,
      });
    }
  });
});

client.on("data", (data) => {
  console.log("Data received from server:", data);
  connectionObservable.next({
    data: data.buffer,
    client,
  });
});

client.on("error", (err) => {
  connectionObservable.error(err);
});

client.on("close", () => {
  connectionObservable.complete();
});

connectionObservable
  .asObservable()
  .pipe(
    catchError((err) => {
      console.error("Error in observable:", err);
      return of(err); // Return an observable with the error
    })
  )
  .subscribe(({ client, data }: {
    client: net.Socket,
    data: ArrayBuffer | Error
  }) => {
    if (data instanceof Error) {
      console.error("Error response:", data);
      return;
    }
    console.log("Response received:", new Uint8Array(data));


    const cmdPacket = new ServerDataExecCommandPacket("status");
    const bytes = cmdPacket.toBytes();
    const uint8Array = new Uint8Array(bytes);
    client?.write(uint8Array, (err) => {
      console.log("Command sent to server:", cmdPacket);
    });

  });
