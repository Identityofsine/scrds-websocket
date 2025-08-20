// This file defines the interface for a packet, including its structure and types. 
// This is used for parsing within this program and should not be send directly over the network
// without passing through the Packet class.

import { PacketDataOrder, PacketDataType } from "../lib/packet.interface.js";

type Constructor<T, R extends T = T> = new (...args: any[]) => R;

export abstract class AbstractPacketField {

  public readonly packetType: PacketDataType = 'uint32';
  public readonly packetOrder: PacketDataOrder = 'little-endian'
  public readonly packetSize: number = 0;
  private readonly _constructor: Constructor<AbstractPacketField>;

  constructor(packetType: PacketDataType, packetOrder: PacketDataOrder, packetSize: number, protected readonly value: number | string = 0, constructor: Constructor<AbstractPacketField>) {
    this.packetType = packetType;
    this.packetOrder = packetOrder;
    this.packetSize = packetSize;
    this.value = value;
    this._constructor = constructor;
  }

  /**
    * Creates a new instance of the packet field with the same type and value.
    * @param {number} fn - The current byte-s value of the packet field.
    * @return {AbstractPacketField} A new instance of the packet field.
    */
  public readonly map = (fn: (v: number) => ArrayBuffer) => {

    //TODO: Implement map function


  };

  public readonly forEach = (fn: (slice: ArrayBuffer) => void) => {
    const bytes = this.toBytes();
    for (let i = 0; i < bytes.byteLength; i += this.packetSize) {
      fn(bytes.slice(i, i + this.packetSize));
    }
  };

  public abstract toBytes(): ArrayBuffer;

  public abstract fromBytes<T extends AbstractPacketField>(bytes: ArrayBuffer): T;
}
