import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { urls } = await req.json();
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'urls array is required' }, { status: 400 });
    }

    const payload = {
      host: 'manireader.online',
      key: 'c4b0c79326e64467bd94b9122fb39a7b',
      keyLocation: 'https://manireader.online/c4b0c79326e64467bd94b9122fb39a7b.txt',
      urlList: urls,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `IndexNow API failed: ${text}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
