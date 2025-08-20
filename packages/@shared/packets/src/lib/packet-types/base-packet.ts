import { AsciiStringPacketField } from "../packet-fields/ascii-string.packet.js";
import { Unsigned32BitPacketField } from "../packet-fields/unsigned-32-bit.packet.js";

export class BasePacket {
  public readonly size = new Unsigned32BitPacketField(10);
  public readonly id = new Unsigned32BitPacketField(16);
  public readonly type = new Unsigned32BitPacketField(4);
  public readonly body = new AsciiStringPacketField('SEXS');
  public readonly emptyString = new AsciiStringPacketField('');


  public toBytes(): ArrayBuffer {
    const sizeBytes = this.size.toBytes();
    const idBytes = this.id.toBytes();
    const typeBytes = this.type.toBytes();
    const bodyBytes = this.body.toBytes();
    const emptyStringBytes = this.emptyString.toBytes();

    const totalSize = sizeBytes.byteLength + idBytes.byteLength + typeBytes.byteLength + bodyBytes.byteLength + emptyStringBytes.byteLength;
    const buffer = new ArrayBuffer(totalSize);
    const view = new Uint8Array(buffer);

    view.set(new Uint8Array(sizeBytes), 0);
    view.set(new Uint8Array(idBytes), sizeBytes.byteLength);
    view.set(new Uint8Array(typeBytes), sizeBytes.byteLength + idBytes.byteLength);
    view.set(new Uint8Array(bodyBytes), sizeBytes.byteLength + idBytes.byteLength + typeBytes.byteLength);
    view.set(new Uint8Array(emptyStringBytes), totalSize - emptyStringBytes.byteLength);

    return buffer;
  }

}
