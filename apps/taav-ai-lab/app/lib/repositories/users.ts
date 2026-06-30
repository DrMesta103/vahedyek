import { isValidIranMobile, normalizeEmail, parseAuthIdentifier, sanitizeIranMobileInput } from '../contact';
import { hashPassword } from '../auth';
import { prisma } from '../prisma';
import type { CreateSimulatorUserInput, SimulatorUser } from '../types/domain';
import { mapAppUser } from '../auth';

export async function getUserByEmail(email: string) {
  const user = await prisma.appUser.findUnique({ where: { email: normalizeEmail(email) } });
  return user ? mapAppUser(user) : null;
}

export async function getUserById(userId: string): Promise<SimulatorUser | null> {
  const user = await prisma.appUser.findUnique({ where: { id: userId } });
  return user ? mapAppUser(user) : null;
}

export async function getUserByIdentifier(identifier: string): Promise<SimulatorUser | null> {
  const parsed = parseAuthIdentifier(identifier);
  if (parsed.type === 'email') return getUserByEmail(parsed.value);
  if (parsed.type === 'mobile') {
    const user = await prisma.appUser.findUnique({ where: { mobile: parsed.value } });
    return user ? mapAppUser(user) : null;
  }
  return null;
}

export async function createSimulatorUser(input: CreateSimulatorUserInput): Promise<SimulatorUser> {
  const identifier = parseAuthIdentifier(input.identifier);
  const mobile = sanitizeIranMobileInput(input.mobile ?? '');
  const { passwordHash, passwordSalt } = hashPassword(input.password);
  const email = identifier.type === 'email' ? identifier.value : null;
  const normalizedMobile =
    identifier.type === 'mobile' ? identifier.value : isValidIranMobile(mobile) ? mobile : null;

  const user = await prisma.appUser.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      fullName: [input.firstName, input.lastName].filter(Boolean).join(' ').trim(),
      email,
      mobile: normalizedMobile,
      passwordHash,
      passwordSalt,
    },
  });

  return mapAppUser(user);
}
