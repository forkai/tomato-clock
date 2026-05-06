import sharp from 'sharp';
import path from 'path';

const svgPath = './build/icon.svg';
const pngPath = './build/icon.png';

// 256x256 for electron-builder
sharp(svgPath)
  .resize(256, 256)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('Icon created at build/icon.png (256x256)');
  })
  .catch(err => {
    console.error('Error creating icon:', err);
  });