import { NextResponse } from 'next/server';
import { getSessionContext } from '../../../lib/auth';

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
    return NextResponse.json({
      user: { id: session.userId, fullName: session.user.fullName, email: session.user.email },
      tenant: session.tenant ? { id: session.tenant.id, name: session.tenant.name, brandCode: session.tenant.brandCode } : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'خطای سرور' }, { status: 500 });
  }
}
