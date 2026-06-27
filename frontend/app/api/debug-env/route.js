import { NextResponse } from 'next/server';
import { blogApi } from '../../../lib/api';

export async function GET() {
  try {
    const res = await blogApi.list('action');
    return NextResponse.json({
      success: true,
      apiURL: res.config?.url || null,
      baseURL: res.config?.baseURL || null,
      data: res.data || null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
      stack: error.stack,
      config: error.config ? {
        url: error.config.url,
        baseURL: error.config.baseURL,
        headers: error.config.headers,
      } : null,
    });
  }
}
