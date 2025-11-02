#!/usr/bin/env node
/**
 * SVG to PNG converter for hammer sprite
 * Converts hammer.svg to hammer.png at 64x64
 */

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertHammerSvgToPng() {
    try {
        // Create a canvas with 64x64 dimensions
        const canvas = createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        // Load the SVG file
        const svgPath = './assets/sprites/hammer.svg';
        const img = await loadImage(svgPath);

        // Draw the SVG to the canvas
        ctx.drawImage(img, 0, 0, 64, 64);

        // Save as PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('./assets/sprites/hammer.png', buffer);

        console.log('✓ Successfully converted hammer.svg to hammer.png (64x64)');
    } catch (error) {
        console.error('Error converting hammer SVG to PNG:', error.message);
        process.exit(1);
    }
}

convertHammerSvgToPng();
