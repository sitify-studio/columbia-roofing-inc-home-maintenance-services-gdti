import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Secret key to prevent unauthorized revalidation
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path, tags } = body;

    // Verify secret key
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret key' },
        { status: 401 }
      );
    }

    // Revalidate specific path if provided
    if (path) {
      revalidatePath(path);
      console.log(`[Revalidate] Revalidated path: ${path}`);
    }

    // Revalidate by tags if provided
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        revalidatePath('/', tag);
      });
      console.log(`[Revalidate] Revalidated tags:`, tags);
    }

    // Revalidate all pages if no specific path/tags
    if (!path && !tags) {
      revalidatePath('/');
      revalidatePath('/services');
      revalidatePath('/blog');
      revalidatePath('/projects');
      revalidatePath('/testimonials');
      console.log('[Revalidate] Revalidated all paths');
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation triggered successfully',
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger revalidation' },
      { status: 500 }
    );
  }
}
