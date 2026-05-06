import sharp from 'sharp';
import path from 'path';

const svgPath = './build/icon.svg';
const pngPath = './build/icon.png';

// Generate 256x256 icon - Windows uses this size for taskbar
sharp(svgPath)
  .resize(256, 256)
  .png({
    density: 96
  })
  .toFile(pngPath)
  .then(() => {
    console.log('Icon created at build/icon.png (256x256)');
  })
  .catch(err => {
    console.error('Error creating icon:', err);
  });