const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32LE(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function dosDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);
  const time = (hours << 11) | (minutes << 5) | seconds;
  const d = ((year - 1980) << 9) | (month << 5) | day;
  return { time, date: d };
}

export async function createStoredZip(files: Array<{ name: string; blob: Blob }>): Promise<Blob> {
  const localFiles = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      data: new Uint8Array(await file.blob.arrayBuffer()),
    })),
  );

  const chunks: Uint8Array[] = [];
  const central: number[] = [];
  let offset = 0;
  const { time, date } = dosDateTime();

  for (const file of localFiles) {
    const nameBytes = encodeUtf8(file.name);
    const crc = crc32(file.data);
    const localHeader: number[] = [];
    writeUint32LE(localHeader, 0x04034b50);
    writeUint16LE(localHeader, 20);
    writeUint16LE(localHeader, 0x0800);
    writeUint16LE(localHeader, 0); // store
    writeUint16LE(localHeader, time);
    writeUint16LE(localHeader, date);
    writeUint32LE(localHeader, crc);
    writeUint32LE(localHeader, file.data.length);
    writeUint32LE(localHeader, file.data.length);
    writeUint16LE(localHeader, nameBytes.length);
    writeUint16LE(localHeader, 0);

    const localHeaderBytes = new Uint8Array(localHeader);
    chunks.push(localHeaderBytes, nameBytes, file.data);

    const centralHeader: number[] = [];
    writeUint32LE(centralHeader, 0x02014b50);
    writeUint16LE(centralHeader, 20);
    writeUint16LE(centralHeader, 20);
    writeUint16LE(centralHeader, 0x0800);
    writeUint16LE(centralHeader, 0);
    writeUint16LE(centralHeader, time);
    writeUint16LE(centralHeader, date);
    writeUint32LE(centralHeader, crc);
    writeUint32LE(centralHeader, file.data.length);
    writeUint32LE(centralHeader, file.data.length);
    writeUint16LE(centralHeader, nameBytes.length);
    writeUint16LE(centralHeader, 0);
    writeUint16LE(centralHeader, 0);
    writeUint16LE(centralHeader, 0);
    writeUint16LE(centralHeader, 0);
    writeUint32LE(centralHeader, 0);
    writeUint32LE(centralHeader, offset);
    central.push(...centralHeader);
    central.push(...nameBytes);

    offset += localHeaderBytes.length + nameBytes.length + file.data.length;
  }

  const centralOffset = offset;
  const centralBytes = new Uint8Array(central);
  chunks.push(centralBytes);
  offset += centralBytes.length;

  const end: number[] = [];
  writeUint32LE(end, 0x06054b50);
  writeUint16LE(end, 0);
  writeUint16LE(end, 0);
  writeUint16LE(end, localFiles.length);
  writeUint16LE(end, localFiles.length);
  writeUint32LE(end, centralBytes.length);
  writeUint32LE(end, centralOffset);
  writeUint16LE(end, 0);
  chunks.push(new Uint8Array(end));

  return new Blob(chunks as BlobPart[], { type: "application/zip" });
}
