const fs = require('fs');

const files = ['dist/taav-business.mjs', 'dist/taav-business.js'];

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  s = s.replaceAll(
    'inline-flex h-[36px] min-w-[148px] items-center justify-center gap-[8px] rounded-[14px]',
    'inline-flex h-[36px] min-w-[148px] items-center justify-center gap-[8px] rounded-[var(--taav-business-header-card-action-radius)]',
  );
  s = s.replaceAll(
    'border-0 bg-[#008f8f] px-[16px] text-[14px] font-bold leading-5 text-white whitespace-nowrap',
    'border-0 bg-[#008f8f] px-[16px] text-[length:var(--taav-business-header-card-action-size)] font-bold leading-5 text-white whitespace-nowrap',
  );
  s = s.replaceAll(
    'min-w-[170px] text-[14px] font-bold',
    'min-w-[170px] text-[length:var(--taav-business-header-card-action-size)] font-bold',
  );
  s = s.replaceAll(
    'min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[12.5px] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none',
    'min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[length:var(--taav-business-header-card-search-size)] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none',
  );

  s = s.replaceAll(
    'md:h-[100px] md:min-h-[100px] md:max-w-[696px] rounded-[16px] border border-[rgba(145,170,190,0.5)]',
    'md:h-[100px] md:min-h-[100px] md:max-w-[696px] rounded-[var(--taav-business-header-card-radius)] border border-[rgba(145,170,190,0.5)]',
  );
  s = s.replaceAll(
    'md:h-[145px] md:min-h-[145px] md:max-w-[690px] rounded-[14px] border border-[rgba(145,170,190,0.5)]',
    'md:h-[145px] md:min-h-[145px] md:max-w-[690px] rounded-[var(--taav-business-header-card-radius-compact)] border border-[rgba(145,170,190,0.5)]',
  );

  s = s.replace(
    'var businessHeaderCardIconBox = cva([\n  "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px]",',
    'var businessHeaderCardIconBox = cva([\n  "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[var(--taav-business-header-card-icon-radius)]",',
  );
  s = s.replace(
    'var businessHeaderCardIconBox = classVarianceAuthority.cva([\n  "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px]",',
    'var businessHeaderCardIconBox = classVarianceAuthority.cva([\n  "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[var(--taav-business-header-card-icon-radius)]",',
  );

  s = s.replace(
    'var businessHeaderCardTitle = cva("m-0 text-right text-[18px] font-semibold leading-[26px] text-[#30343b]", {',
    'var businessHeaderCardTitle = cva("m-0 text-right text-[length:var(--taav-business-header-card-title-size)] font-semibold leading-[var(--taav-business-header-card-title-leading)] text-[#30343b]", {',
  );
  s = s.replace(
    'var businessHeaderCardTitle = classVarianceAuthority.cva("m-0 text-right text-[18px] font-semibold leading-[26px] text-[#30343b]", {',
    'var businessHeaderCardTitle = classVarianceAuthority.cva("m-0 text-right text-[length:var(--taav-business-header-card-title-size)] font-semibold leading-[var(--taav-business-header-card-title-leading)] text-[#30343b]", {',
  );

  s = s.replaceAll(
    'w-full text-right text-[18px] font-semibold leading-[22px]',
    'w-full text-right text-[length:var(--taav-business-header-card-title-size)] font-semibold leading-[var(--taav-business-header-card-title-leading-tight)]',
  );
  s = s.replaceAll(
    'w-full text-right text-[18px] font-bold leading-[26px] text-[#30343b]',
    'w-full text-right text-[length:var(--taav-business-header-card-title-size)] font-bold leading-[var(--taav-business-header-card-title-leading)] text-[#30343b]',
  );

  s = s.replace(
    'var businessHeaderCardDescription = cva(\n  "m-0 max-w-[520px] text-right text-[12.5px] font-medium leading-[22px] text-[#5f6f80]",',
    'var businessHeaderCardDescription = cva(\n  "m-0 max-w-[520px] text-right text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[#5f6f80]",',
  );
  s = s.replace(
    'var businessHeaderCardDescription = classVarianceAuthority.cva(\n  "m-0 max-w-[520px] text-right text-[12.5px] font-medium leading-[22px] text-[#5f6f80]",',
    'var businessHeaderCardDescription = classVarianceAuthority.cva(\n  "m-0 max-w-[520px] text-right text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[#5f6f80]",',
  );

  s = s.replaceAll(
    'md:w-[520px] md:max-w-[520px] text-[12.5px] font-medium leading-[20px]',
    'md:w-[520px] md:max-w-[520px] text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading-tight)]',
  );
  s = s.replaceAll(
    'whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#6b7280]',
    'whitespace-nowrap text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[#6b7280]',
  );
  s = s.replaceAll(
    'whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#5f6f80]',
    'whitespace-nowrap text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[#5f6f80]',
  );

  if (s === before) {
    console.log(`${file}: NO CHANGES`);
  } else {
    fs.writeFileSync(file, s);
    console.log(`${file}: patched delta=${s.length - before.length}`);
  }
}
