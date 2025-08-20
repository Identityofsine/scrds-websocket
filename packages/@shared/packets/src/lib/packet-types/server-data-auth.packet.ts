import { PacketData } from "../packet.interface.js";

export const SERVER_DATA_AUTH_PACKET: PacketData = {
  type: 'uint32',
  value: 0x00000001, // Example value, replace with actual authentication data
  order: 'big-endian'
}
