// utils/addLogoToImage.js
const sharp = require('sharp');

async function addLogoToImage(inputPath, logoPath, outputPath) {
  const baseImage = sharp(inputPath);
  const { width, height } = await baseImage.metadata();

  const logoWidth = Math.floor(width * 0.3); // 👈 Increase logo to 30% of image width

  const logoBuffer = await sharp(logoPath)
    .resize({ width: logoWidth }) // Resize logo
    .png()
    .toBuffer();

  const logoMetadata = await sharp(logoBuffer).metadata();

  const left = width - logoMetadata.width - 20; // 👈 Bottom-right
  const top = height - logoMetadata.height - 20;

  await baseImage
    .composite([{ input: logoBuffer, left, top }])
    .toFile(outputPath);
}

module.exports = addLogoToImage;
