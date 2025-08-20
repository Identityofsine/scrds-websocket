import { BasePacket } from '@shared/packets';

const bytes = new BasePacket().toBytes()
// print out all of the bytes in the array
const byteArray = new Uint8Array(bytes);
console.log('Packet Bytes:', byteArray);
