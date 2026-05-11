import { scryptSync } from 'node:crypto';
import {
  PrismaClient,
  ContractorType,
  ContractType,
  DirectoryRole,
  PartySide,
  PersonType,
  PricingType,
  ShareMode,
} from '../node_modules/.prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ساخت تننت نمونه
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'lind' },
    update: {
      name: 'لیند',
      brandCode: 'LIND',
    },
    create: {
      slug: 'lind',
      name: 'لیند',
      brandCode: 'LIND',
    },
  });

  // کاربر پیش‌فرض برای ورود (global — بدون tenantId)
  const passwordSalt = 'vahedyek-demo-salt';
  const passwordHash = scryptSync('admin123', passwordSalt, 64).toString('hex');

  const user = await prisma.appUser.upsert({
    where: { email: 'admin@lind.ir' },
    update: {
      firstName: 'علی',
      lastName: 'علی‌نقی پور',
      fullName: 'علی علی‌نقی پور',
      mobile: '9121000001',
      passwordHash,
      passwordSalt,
    },
    create: {
      firstName: 'علی',
      lastName: 'علی‌نقی پور',
      fullName: 'علی علی‌نقی پور',
      email: 'admin@lind.ir',
      mobile: '9121000001',
      passwordHash,
      passwordSalt,
    },
  });

  // عضویت کاربر در تننت
  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    update: {},
    create: { userId: user.id, tenantId: tenant.id, role: 'owner' },
  });

  // داده مرجع پرسنل
  await prisma.employee.createMany({
    data: [
      { id: 'emp-001', tenantId: tenant.id, firstName: 'علی', lastName: 'محمدی' },
      { id: 'emp-002', tenantId: tenant.id, firstName: 'سارا', lastName: 'احمدی' },
      { id: 'emp-003', tenantId: tenant.id, firstName: 'رضا', lastName: 'کاظمی' },
    ],
    skipDuplicates: true,
  });

  // بلوک‌ها و واحدها
  await prisma.block.createMany({
    data: [
      { id: 'block-001', tenantId: tenant.id, name: 'بلوک آفتاب' },
      { id: 'block-002', tenantId: tenant.id, name: 'بلوک سپهر' },
      { id: 'block-003', tenantId: tenant.id, name: 'بلوک نگین' },
    ],
    skipDuplicates: true,
  });

  await prisma.unit.createMany({
    data: [
      { id: 'unit-001', tenantId: tenant.id, blockId: 'block-001', floorName: 'طبقه اول', name: 'واحد ۱۰۱' },
      { id: 'unit-002', tenantId: tenant.id, blockId: 'block-001', floorName: 'طبقه اول', name: 'واحد ۱۰۲' },
      { id: 'unit-003', tenantId: tenant.id, blockId: 'block-001', floorName: 'طبقه دوم', name: 'واحد ۲۰۱' },
      { id: 'unit-004', tenantId: tenant.id, blockId: 'block-001', floorName: 'طبقه دوم', name: 'واحد ۲۰۲' },
      { id: 'unit-005', tenantId: tenant.id, blockId: 'block-002', floorName: 'طبقه همکف', name: 'واحد G01' },
      { id: 'unit-006', tenantId: tenant.id, blockId: 'block-002', floorName: 'طبقه اول', name: 'واحد ۱۱۱' },
      { id: 'unit-007', tenantId: tenant.id, blockId: 'block-002', floorName: 'طبقه سوم', name: 'واحد ۳۰۱' },
      { id: 'unit-008', tenantId: tenant.id, blockId: 'block-003', floorName: 'طبقه دوم', name: 'واحد ۲۲۱' },
      { id: 'unit-009', tenantId: tenant.id, blockId: 'block-003', floorName: 'طبقه سوم', name: 'واحد ۳۲۱' },
      { id: 'unit-010', tenantId: tenant.id, blockId: 'block-003', floorName: 'طبقه چهارم', name: 'واحد ۴۰۱' },
    ],
    skipDuplicates: true,
  });

  // دفترچه اشخاص
  await prisma.directoryPerson.createMany({
    data: [
      { id: 'partner-natural-1', tenantId: tenant.id, name: 'علی رضایی', role: DirectoryRole.partner, personType: PersonType.natural },
      { id: 'partner-natural-2', tenantId: tenant.id, name: 'مریم احمدی', role: DirectoryRole.partner, personType: PersonType.natural },
      { id: 'partner-natural-3', tenantId: tenant.id, name: 'حسین کریمی', role: DirectoryRole.partner, personType: PersonType.natural },
      { id: 'partner-legal-1', tenantId: tenant.id, name: 'شرکت فپکو', role: DirectoryRole.partner, personType: PersonType.legal },
      { id: 'partner-legal-2', tenantId: tenant.id, name: 'شرکت توسعه سپهر', role: DirectoryRole.partner, personType: PersonType.legal },
      { id: 'partner-legal-3', tenantId: tenant.id, name: 'موسسه سرمایه گستر', role: DirectoryRole.partner, personType: PersonType.legal },
      { id: 'buyer-natural-1', tenantId: tenant.id, name: 'سارا محمدی', role: DirectoryRole.buyer, personType: PersonType.natural },
      { id: 'buyer-natural-2', tenantId: tenant.id, name: 'رضا عباسی', role: DirectoryRole.buyer, personType: PersonType.natural },
      { id: 'buyer-natural-3', tenantId: tenant.id, name: 'نرگس یوسفی', role: DirectoryRole.buyer, personType: PersonType.natural },
      { id: 'buyer-legal-1', tenantId: tenant.id, name: 'شرکت افق سازان', role: DirectoryRole.buyer, personType: PersonType.legal },
      { id: 'buyer-legal-2', tenantId: tenant.id, name: 'شرکت آتیه مسکن', role: DirectoryRole.buyer, personType: PersonType.legal },
      { id: 'buyer-legal-3', tenantId: tenant.id, name: 'گروه سرمایه گذاری پرگاس', role: DirectoryRole.buyer, personType: PersonType.legal },
    ],
    skipDuplicates: true,
  });

  // پیش‌نویس نمونه
  const draft = await prisma.contractDraft.upsert({
    where: { id: 'draft-demo-001' },
    update: { tenantId: tenant.id },
    create: { id: 'draft-demo-001', tenantId: tenant.id },
  });

  await prisma.contractSubject.upsert({
    where: { draftId: draft.id },
    update: {},
    create: {
      draftId: draft.id,
      contractorType: ContractorType.self,
      contractType: ContractType.pre_sale,
      contractDate: '1405/01/20',
      contractNumber: 'CNT-1405-001',
      deliveryDate: '1405/06/15',
      blockId: 'block-001',
      unitId: 'unit-001',
    },
  });

  const parties = await prisma.contractParties.upsert({
    where: { draftId: draft.id },
    update: {},
    create: {
      draftId: draft.id,
      partyOneMode: ShareMode.dang,
      partyTwoMode: ShareMode.percent,
    },
  });

  await prisma.contractPartyMember.createMany({
    data: [
      {
        id: 'draft-demo-001-party-1',
        partiesId: parties.id,
        side: PartySide.party_one,
        personId: 'partner-legal-1',
        directoryId: 'partner-legal-1',
        personType: PersonType.legal,
        name: 'شرکت فپکو',
        shareValue: 6,
        isPrimary: true,
      },
      {
        id: 'draft-demo-001-party-2',
        partiesId: parties.id,
        side: PartySide.party_two,
        personId: 'buyer-natural-1',
        directoryId: 'buyer-natural-1',
        personType: PersonType.natural,
        name: 'سارا محمدی',
        shareValue: 60,
        isPrimary: true,
      },
      {
        id: 'draft-demo-001-party-3',
        partiesId: parties.id,
        side: PartySide.party_two,
        personId: 'buyer-natural-2',
        directoryId: 'buyer-natural-2',
        personType: PersonType.natural,
        name: 'رضا عباسی',
        shareValue: 40,
        isPrimary: false,
      },
    ],
    skipDuplicates: true,
  });

  const financial = await prisma.contractFinancial.upsert({
    where: { draftId: draft.id },
    update: {},
    create: {
      draftId: draft.id,
      pricingType: PricingType.fixed,
      fixedTotalAmount: 12_500_000_000,
      activeTab: 'advance',
    },
  });

  await prisma.financialCategory.createMany({
    data: [
      {
        id: 'advance',
        financialId: financial.id,
        name: 'پیش پرداخت',
        capAmount: 2_500_000_000,
        dueAmount: 2_500_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: 'document',
        financialId: financial.id,
        name: 'تحویل سند',
        capAmount: 3_000_000_000,
        dueAmount: 3_000_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.financialDueItem.createMany({
    data: [
      {
        id: 'draft-demo-001-due-1',
        financialId: financial.id,
        categoryId: 'advance',
        amount: 2_500_000_000,
        dueDate: '1405/02/01',
      },
      {
        id: 'draft-demo-001-due-2',
        financialId: financial.id,
        categoryId: 'document',
        amount: 3_000_000_000,
        dueDate: '1405/04/01',
      },
    ],
    skipDuplicates: true,
  });

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('خطا در seed دیتابیس:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
