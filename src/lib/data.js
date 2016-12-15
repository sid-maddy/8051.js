const sfrMap = new Map([
  ['A', 0xE0],
  ['B', 0xF0],
  ['P0', 0x80],
  ['P1', 0x90],
  ['P2', 0xA0],
  ['P3', 0xB0],
  ['SP', 0x81],
  ['DPL', 0x82],
  ['DPH', 0x83],
  ['PCON', 0x87],
  ['TCON', 0x88],
  ['TMOD', 0x89],
  ['TL0', 0x8A],
  ['TL1', 0x8B],
  ['TH0', 0x8C],
  ['TH1', 0x8D],
  ['SCON', 0x98],
  ['SBUF', 0x99],
  ['IE', 0xA8],
  ['IP', 0xB8],
  ['PSW', 0xD0],
]);

const ram = new Uint8ClampedArray(257);
ram[sfrMap.get('SP')] = 0x07;

export default {
  sfrMap,
  ram,
  code: '',
  labels: new Map(),
  programCounter: 0,
};
