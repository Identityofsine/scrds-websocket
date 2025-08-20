import { AsciiStringPacketField } from "../packet-fields/ascii-string.packet.js";
import { Unsigned32BitPacketField } from "../packet-fields/unsigned-32-bit.packet.js";

export class ServerDataAuthPacket {
  public readonly size = new Unsigned32BitPacketField(13);
  public readonly id = new Unsigned32BitPacketField(16);
  public readonly type = new Unsigned32BitPacketField(3);
  public readonly body = new AsciiStringPacketField("mimi");

  public toBytes(): ArrayBuffer {
    const sizeBytes = this.size.toBytes();
    const idBytes = this.id.toBytes();
    const typeBytes = this.type.toBytes();
    const bodyBytes = this.body.toBytes();

    const totalSize =
      sizeBytes.byteLength +
      idBytes.byteLength +
      typeBytes.byteLength +
      bodyBytes.byteLength;
    const buffer = new ArrayBuffer(totalSize);
    const view = new Uint8Array(buffer);

    view.set(new Uint8Array(sizeBytes), 0);
    view.set(new Uint8Array(idBytes), sizeBytes.byteLength);
    view.set(
      new Uint8Array(typeBytes),
      sizeBytes.byteLength + idBytes.byteLength
    );
    view.set(
      new Uint8Array(bodyBytes),
      sizeBytes.byteLength + idBytes.byteLength + typeBytes.byteLength
    );

    return buffer;
  }
}
