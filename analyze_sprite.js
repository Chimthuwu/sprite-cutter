import https from 'https';
import { PNG } from 'pngjs';

https.get('https://i.ibb.co/KzS51L5v/image.png', res => {
  res.pipe(new PNG()).on('parsed', function() {
    let bgR = this.data[0];
    let bgG = this.data[1];
    let bgB = this.data[2];
    
    let minX = this.width, maxX = 0, minY = this.height, maxY = 0;
    
    // Find first non-bg pixel in top-left quadrant (roughly guess one sprite)
    for (let y = 0; y < this.height / 2; y++) {
      for (let x = 0; x < this.width / 4; x++) {
        let idx = (this.width * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        let diff = Math.abs(r-bgR) + Math.abs(g-bgG) + Math.abs(b-bgB);
        
        if (diff > 10) { // Not background
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log(`First sprite bound: X: ${minX}-${maxX}, Y: ${minY}-${maxY}`);
    console.log(`Width: ${maxX - minX}, Height: ${maxY - minY}`);
  });
});
