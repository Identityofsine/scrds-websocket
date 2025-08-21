import { AsciiStringPacketField } from "../packet-fields/ascii-string.packet.js";
import { AbstractPacket } from "./abstract-packet.js";
import { PacketType } from "./packet-type.interface.js";

export class ServerDataAuthPacket extends AbstractPacket {
  public readonly body: AsciiStringPacketField;

  constructor(password: string = "mimi") {
    super(PacketType.SERVERDATA_AUTH); // Assuming 1 is the packet type for authentication
    this.body = new AsciiStringPacketField(password);
  }

}
