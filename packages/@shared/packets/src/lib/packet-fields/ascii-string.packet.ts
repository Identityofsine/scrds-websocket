import { AbstractPacketField } from "./abstract-packet-field.js";

export class AsciiStringPacketField extends AbstractPacketField {

  constructor(value: string) {
    value = value.padEnd(1, '\n');
    super('string', 'little-endian', value.length, value, AsciiStringPacketField);
  }

  public toBytes(): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(super.value as string).buffer as ArrayBuffer;
  }

  public fromBytes<T extends AbstractPacketField>(bytes: ArrayBuffer): T {
    const decoder = new TextDecoder();
    const value = decoder.decode(bytes);
    return new AsciiStringPacketField(value) as T;
  }
}
