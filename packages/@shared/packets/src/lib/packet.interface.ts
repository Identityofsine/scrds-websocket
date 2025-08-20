export type PacketDataOrder = 'big-endian' | 'little-endian'
export type PacketDataType = 'uint32' | 'int32' | 'byte' | 'string'

export type PacketData = {
  type: PacketDataType
  value: number | string
  order?: PacketDataOrder
}
