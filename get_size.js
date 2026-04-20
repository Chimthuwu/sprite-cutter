import https from 'https';

https.get('https://i.ibb.co/KzS51L5v/image.png', (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const w = buffer.readUInt32BE(16);
    const h = buffer.readUInt32BE(20);
    console.log(`Width: ${w}, Height: ${h}`);
  });
});
