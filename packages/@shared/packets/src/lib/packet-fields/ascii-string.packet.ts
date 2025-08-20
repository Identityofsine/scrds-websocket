import { AbstractPacketField } from "./abstract-packet-field.js";

export class AsciiStringPacketField extends AbstractPacketField {
  readonly asciiStr: string;

  constructor(value: string) {
    value = (value || "") + "\0"; // Ensure at least one character
    super(
      "string",
      "little-endian",
      value.length,
      value,
      AsciiStringPacketField
    );
    this.asciiStr = value;
  }

  public toBytes(): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(this.asciiStr as string).buffer as ArrayBuffer;
  }

  public fromBytes<T extends AbstractPacketField>(bytes: ArrayBuffer): T {
    const decoder = new TextDecoder();
    const value = decoder.decode(bytes);
    return new AsciiStringPacketField(value) as unknown as T;
  }
}
