
import { AsciiStringPacketField } from "../packet-fields/ascii-string.packet.js";
import { AbstractPacket } from "./abstract-packet.js";
import { PacketType } from "./packet-type.interface.js";

export class ServerDataExecCommandPacket extends AbstractPacket {
  public readonly body;

  public constructor(
    command = "status"
  ) {
    super(PacketType.SERVERDATA_EXECCOMMAND)
    this.body = new AsciiStringPacketField(command);
  }
}
