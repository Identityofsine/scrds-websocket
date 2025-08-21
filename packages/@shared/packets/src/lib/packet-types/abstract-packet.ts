import { AbstractPacketField } from "../packet-fields/abstract-packet-field.js"
import { Unsigned32BitPacketField } from "../packet-fields/unsigned-32-bit.packet.js";

export class AbstractPacket {
  public static readonly SIZE_OFFSET = 4;
  public readonly id: Unsigned32BitPacketField;
  public readonly type: Unsigned32BitPacketField;

  constructor(packetType: number = 0) {
    const randomId = Math.floor(Math.random() * 100);
    this.id = new Unsigned32BitPacketField(randomId);
    this.type = new Unsigned32BitPacketField(packetType);
  }

  public toBytes(): ArrayBuffer {

    const packetFields: AbstractPacketField[] = Object.values(this).filter((value) => {
      return AbstractPacketField.isPacketType(value)
    }) as AbstractPacketField[]


    //total packet size
    const size = packetFields.reduce((acc, field) => acc + field.toBytes().byteLength, 0);

    const buffer = new ArrayBuffer(size + AbstractPacket.SIZE_OFFSET); // +4 for size field
    const view = new Uint8Array(buffer);

    // handle size field
    view.set(new Uint8Array(new Unsigned32BitPacketField(size).toBytes()), 0);

    let offset = AbstractPacket.SIZE_OFFSET;
    packetFields.forEach((field: AbstractPacketField) => {
      const bytes = field.toBytes?.()
      view.set(new Uint8Array(bytes), offset);
      offset += bytes.byteLength;
    });

    return buffer;

  }

  public toUnsigned8BitBytes(): Uint8Array {
    const bytes = this.toBytes();
    return new Uint8Array(bytes);
  }

}
