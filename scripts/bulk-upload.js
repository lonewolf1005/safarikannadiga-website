/**
 * Fast Upload photos to ImageKit (parallel uploads)
 * 
 * Usage: node scripts/upload-to-imagekit-fast.js
 */

const ImageKit = require('@imagekit/nodejs').default;
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize ImageKit
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// Configuration
const PARALLEL_UPLOADS = 5;  // Upload 5 files at a time
const GALLERY_ROOT = 'safari-gallery';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Photo sources
const PHOTO_SOURCES = [
    {
        baseDir: 'C:\\Users\\samar\\Downloads\\Safari Kannadiga Photos - Website Upload-20260123T184632Z-3-001\\Safari Kannadiga Photos - Website Upload',
        continent: 'Africa'
    },
];

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getLocationFolders(source) {
    try {
        return fs.readdirSync(source.baseDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => ({
                continent: source.continent,
                location: d.name,
                path: path.join(source.baseDir, d.name)
            }));
    } catch (error) {
        console.error(`Error reading ${source.baseDir}:`, error.message);
        return [];
    }
}

function getImageFiles(dir) {
    try {
        return fs.readdirSync(dir)
            .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
            .map(f => {
                const fullPath = path.join(dir, f);
                const stats = fs.statSync(fullPath);
                return { path: fullPath, name: f, size: stats.size };
            });
    } catch (error) {
        return [];
    }
}

const admin = require('firebase-admin');

// Initialize Firebase Admin if environment variables exist
let db = null;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
        if (!admin.apps.length) {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
        }
        db = admin.firestore();
        console.log('Firebase Admin initialized for bulk upload script.');
    } catch (e) {
        console.warn('Firebase Admin init warning:', e.message);
    }
}

async function uploadFile(file, folder, locInfo) {
    try {
        const fileBuffer = fs.readFileSync(file.path);
        
        const response = await imagekit.files.upload({
            file: fileBuffer,
            fileName: file.name,
            folder: folder,
            useUniqueFileName: false,
        });

        if (db && response.fileId) {
            const folderPath = folder.startsWith('/') ? folder : `/${folder}`;
            await db.collection('gallery_images').doc(response.fileId).set({
                file_id: response.fileId,
                file_path: response.filePath,
                url: response.url,
                name: file.name,
                folder_path: folderPath,
                continent_name: locInfo ? locInfo.continent : undefined,
                location_name: locInfo ? locInfo.location : undefined,
                approved: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        
        return { success: true, file: file.name, url: response.url };
    } catch (error) {
        return { success: false, file: file.name, error: error.message };
    }
}

async function uploadBatch(files, folder, locInfo) {
    return Promise.all(files.map(f => uploadFile(f, folder, locInfo)));
}

async function main() {
    console.log('=== ImageKit Fast Upload ===\n');
    
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        console.error('ERROR: IMAGEKIT_PRIVATE_KEY not set');
        process.exit(1);
    }

    let totalUploaded = 0;
    let totalFailed = 0;
    const startTime = Date.now();

    for (const source of PHOTO_SOURCES) {
        if (!fs.existsSync(source.baseDir)) continue;
        
        const locations = getLocationFolders(source);
        console.log(`Found ${locations.length} locations in ${source.continent}\n`);
        
        for (const loc of locations) {
            const folder = `/${GALLERY_ROOT}/${loc.continent}/${loc.location}`;
            const images = getImageFiles(loc.path);
            
            if (images.length === 0) continue;
            
            const totalSize = images.reduce((sum, f) => sum + f.size, 0);
            console.log(`\n📁 ${loc.location}: ${images.length} images (${formatSize(totalSize)})`);
            
            // Upload in parallel batches
            for (let i = 0; i < images.length; i += PARALLEL_UPLOADS) {
                const batch = images.slice(i, i + PARALLEL_UPLOADS);
                const results = await uploadBatch(batch, folder, loc);
                
                for (const r of results) {
                    if (r.success) {
                        totalUploaded++;
                        process.stdout.write('✓');
                    } else {
                        totalFailed++;
                        process.stdout.write('✗');
                        console.log(`\n   Failed: ${r.file} - ${r.error}`);
                    }
                }
            }
            console.log(` Done!`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n=== Complete ===`);
    console.log(`Uploaded: ${totalUploaded}, Failed: ${totalFailed}`);
    console.log(`Time: ${elapsed}s`);
}

main().catch(console.error);
