import { ServerDataAuthPacket } from "@shared/packets";
import * as net from "net";
import { BehaviorSubject, catchError, of } from "rxjs";

const bytes = new ServerDataAuthPacket().toBytes();
// print out all of the bytes in the array
const byteArray = new Uint8Array(bytes);
console.log("Packet Bytes:", byteArray);

const connectionObservable = new BehaviorSubject<any>(null);

// simple tcp socket client
const client = new net.Socket();
client.connect(
  {
    host: "10.2.2.2",
    port: 27015,
  },
  () => connectionObservable.next("Connected")
);

connectionObservable.next(() => {
  client.on("connect", () => {
    console.log("Connected to server");
    client.write(byteArray);
  });

  client.on("data", (data) => {
    console.log("Received data:", new Uint8Array(data));
  });

  client.on("error", (err) => {
    console.error("Socket error:", err);
  });

  client.on("close", () => {
    console.log("Connection closed");
  });
});

connectionObservable
  .asObservable()
  .pipe(
    catchError((err) => {
      console.error("Error in observable:", err);
      return of(err); // Return an observable with the error
    })
  )
  .subscribe((resp) => {
    if (resp instanceof Error) {
      console.error("Error response:", resp);
      return;
    }
    console.log("Response received:", new Uint8Array(resp));
  });
