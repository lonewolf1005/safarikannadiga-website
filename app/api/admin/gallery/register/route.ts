import { NextResponse } from 'next/server';
import { registerUploadedImage } from '@/lib/gallery-cloud';
import { getAuthenticatedUser } from '@/lib/firebase-auth';
import { recordAuditTrail } from '@/lib/audit';

export async function POST(req: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { fileId, filePath, url, name, folderPath, continentName, locationName, country, width, height, size } = body;

        if (!fileId || !filePath || !url || !name || !folderPath) {
            return NextResponse.json({ error: 'Missing required image metadata fields' }, { status: 400 });
        }

        const result = await registerUploadedImage({
            fileId,
            filePath,
            url,
            name,
            folderPath,
            continentName,
            locationName,
            country,
            width,
            height,
            size,
        });

        if (result.success) {
            await recordAuditTrail('CREATE', 'GALLERY', fileId, {
                fileId,
                filePath,
                url,
                continentName,
                locationName,
                country,
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Register Image Error:', error);
        return NextResponse.json({ error: 'Failed to register uploaded image' }, { status: 500 });
    }
}
