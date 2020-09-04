import { Socket } from 'dgram';

export const buildLookupWithKeyPayload = (socket: Socket, p2pDid: string, dskKey: string): Buffer => {
  const p2pDidBuffer = p2pDidToBuffer(p2pDid);

  const port = socket.address().port;
  const portAsBuffer = intToBufferBE(port);
  const portLittleEndianBuffer = Buffer.from([portAsBuffer[2], portAsBuffer[1]]);
  const ip = socket.address().address;
  const ipAsBuffer = Buffer.from(ip.split('.'));

  const splitter = Buffer.from([0x00, 0x00]);
  const magic = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x04, 0x00, 0x00]);

  const dskKeyAsBuffer = Buffer.from(dskKey);

  const fourEmpty = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  return Buffer.concat([p2pDidBuffer, splitter, portLittleEndianBuffer, ipAsBuffer, magic, dskKeyAsBuffer, fourEmpty]);
};

export const buildCheckCamPayload = (p2pDid: string): Buffer => {
  const p2pDidBuffer = p2pDidToBuffer(p2pDid);
  const magic = Buffer.from([0x00, 0x00, 0x00]);
  return Buffer.concat([p2pDidBuffer, magic]);
};

export const buildIntCommandPayload = (value: number, actor: string): Buffer => {
  const headerBuffer = Buffer.from([0x84, 0x00]);
  const magicBuffer = Buffer.from([0x00, 0x00, 0x01, 0x00, 0xff, 0x00, 0x00, 0x00]);
  const valueBuffer = Buffer.from([value]);
  const magicBuffer2 = Buffer.from([0x00, 0x00, 0x00]);
  const actorBuffer = Buffer.from(actor);
  const rest = Buffer.alloc(88);
  return Buffer.concat([headerBuffer, magicBuffer, valueBuffer, magicBuffer2, actorBuffer, rest]);
};

export const buildIntStringCommandPayload = (value: number, actor: string): Buffer => {
  const headerBuffer = Buffer.from([0x88, 0x00]);
  const magicBuffer = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const valueBuffer = Buffer.from([value]);
  const magicBuffer2 = Buffer.from([0x00, 0x00, 0x00]);
  const actorBuffer = Buffer.from(actor);
  const rest = Buffer.alloc(88);
  return Buffer.concat([headerBuffer, magicBuffer, valueBuffer, magicBuffer2, actorBuffer, rest]);
};

const intToArray = (inp: string | number): Array<number> => {
  const digit = parseInt(inp.toString(), 10);
  let str = digit.toString(16);
  switch (str.length) {
    case 1:
      str = '00000' + str;
      break;
    case 2:
      str = '0000' + str;
      break;
    case 3:
      str = '000' + str;
      break;
    case 4:
      str = '00' + str;
      break;
    case 5:
      str = '0' + str;
      break;
  }
  const first = parseInt(str.substr(0, 2), 16);
  const second = parseInt(str.substr(2, 2), 16);
  const third = parseInt(str.substr(4, 2), 16);
  return [first, second, third];
};

export const intToBufferBE = (inp: string | number, bufferLength: number | null = null): Buffer => {
  const array = intToArray(inp);
  return Buffer.from(applyLength(array, bufferLength));
};

export const intToBufferLE = (inp: string | number, bufferLength: number | null = null): Buffer => {
  const array = intToArray(inp);
  array.reverse();
  return Buffer.from(applyLength(array, bufferLength));
};

const applyLength = (inp: Array<number>, bufferLength: number | null = null): Array<number> => {
  if (!bufferLength) {
    return inp;
  }

  if (bufferLength < inp.length) {
    return inp.slice(0, bufferLength);
  } else if (bufferLength > inp.length) {
    for (let i = 0; i <= bufferLength - inp.length; i++) {
      inp.push(0);
    }
    return inp;
  }

  return inp;
};

const p2pDidToBuffer = (p2pDid: string): Buffer => {
  const p2pArray = p2pDid.split('-');
  const buf1 = Buffer.from(p2pArray[0]);
  const fst = intToBufferBE(p2pArray[1]);
  const numeric = Buffer.concat([Buffer.from([0x00, 0x00]), fst]);
  const buf2 = Buffer.from(numeric);
  const buf3 = Buffer.from(p2pArray[2]);
  const buf4 = Buffer.from([0x00, 0x00, 0x00]);
  return Buffer.concat([buf1, buf2, buf3, buf4], 20);
};
