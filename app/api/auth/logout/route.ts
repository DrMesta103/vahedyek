import { NextResponse } from 'next/server';
import { clearAuthCookie } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
