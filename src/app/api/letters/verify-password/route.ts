import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Server-side password check - şifre sadece server'da
    const LETTERS_PASSWORD = process.env.LETTERS_PASSWORD || 'pırt';

    if (password === LETTERS_PASSWORD) {
      // Başarılı - session cookie'ye ekle
      const response = NextResponse.json({ success: true });
      
      // 8 saatlik session cookie
      response.cookies.set('letters_unlocked', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60, // 8 saat
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Letter password verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Session kontrolü için GET endpoint
export async function GET(request: NextRequest) {
  try {
    const isUnlocked = request.cookies.get('letters_unlocked')?.value === 'true';
    
    return NextResponse.json({ unlocked: isUnlocked });
  } catch (error) {
    console.error('Letter unlock check error:', error);
    return NextResponse.json({ unlocked: false });
  }
}

