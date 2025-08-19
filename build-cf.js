#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function buildForCloudflare() {
  try {
    console.log('🚀 Building PictoText for Cloudflare Pages deployment...');
    
    // Step 1: Build frontend with Vite
    console.log('📦 Building frontend...');
    await execAsync('vite build');
    
    // Step 2: Build backend with esbuild
    console.log('⚙️  Building backend...');
    await execAsync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    
    // Step 3: Copy necessary files
    console.log('📋 Copying configuration files...');
    
    // Copy package.json for production dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const prodPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      type: "module",
      dependencies: packageJson.dependencies,
      scripts: {
        start: "node index.js"
      }
    };
    fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    console.log('✅ Build completed successfully!');
    console.log('📁 Files ready in ./dist directory for Cloudflare Pages');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildForCloudflare();