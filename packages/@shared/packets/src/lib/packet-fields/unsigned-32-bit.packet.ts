import { AbstractPacketField } from "../abstract-packet-field.js";

export class Unsigned32BitPacketField extends AbstractPacketField {

  constructor(value: number) {
    super('uint32',
      'little-endian',
      4,
      value,
      Unsigned32BitPacketField
    );
  }

  public toBytes(): ArrayBuffer {
    const buffer = new ArrayBuffer(4);
    return buffer;
  }

  public fromBytes<T extends AbstractPacketField>(bytes: ArrayBuffer): T {
    const view = new DataView(bytes);
    const value = view.getUint32(0, this.packetOrder === 'little-endian');
    return new Unsigned32BitPacketField(value) as T;
  }

}
