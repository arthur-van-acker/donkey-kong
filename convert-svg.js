#!/usr/bin/env node
/**
 * Simple SVG to PNG converter for barrel sprite
 * Converts barrel-rolling.svg to barrel.png
 */

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng() {
    try {
        // Create a canvas with the dimensions of the sprite sheet (512x64)
        const canvas = createCanvas(512, 64);
        const ctx = canvas.getContext('2d');

        // Load the SVG file
        const svgPath = './assets/sprites/barrel-rolling-v2.svg';
        const img = await loadImage(svgPath);

        // Draw the SVG to the canvas
        ctx.drawImage(img, 0, 0, 512, 64);

        // Save as PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('./assets/sprites/barrel.png', buffer);

        console.log('✓ Successfully converted barrel-rolling.svg to barrel.png');
    } catch (error) {
        console.error('Error converting SVG to PNG:', error.message);
        process.exit(1);
    }
}

convertSvgToPng();
