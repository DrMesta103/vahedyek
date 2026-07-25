'use client';

import { useState, type ReactNode } from 'react';
import {
  TaavApprovalUserForm,
  TaavPlateForm,
  TaavProjectTechnicalInfoForm,
  type TaavApprovalUser,
} from '@repo/ui/taav/business';
import { TaavDialog } from '@repo/ui/taav/overlays';
import { TaavButton, TaavDivider } from '@repo/ui/taav/primitives';
import { DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const DIALOG_PROPS = [
  { name: 'open', type: 'boolean', description: 'وضعیت باز یا بسته بودن دیالوگ' },
  { name: 'title / description', type: 'string', description: 'عنوان و توضیح بالای دیالوگ' },
  { name: 'children', type: 'ReactNode', description: 'فرم یا محتوای قابل تزریق' },
  { name: 'confirmLabel / cancelLabel', type: 'string', description: 'عنوان عملیات پایین دیالوگ' },
  { name: 'showFooter / showConfirm / showCancel', type: 'boolean', description: 'کنترل نمایش بخش عملیات' },
  { name: 'confirmDisabled / cancelDisabled', type: 'boolean', description: 'غیرفعال‌سازی عملیات' },
  { name: 'loading', type: 'boolean', description: 'نمایش وضعیت در حال انجام' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'عرض کنترل‌شده دیالوگ' },
  { name: 'variant', type: "'default' | 'form' | 'selection'", defaultValue: 'default', description: 'ساختار محتوایی دیالوگ' },
  { name: 'footerVariant', type: "'default' | 'sticky' | 'separated'", defaultValue: 'separated', description: 'نوع نمایش بخش عملیات' },
];

const INITIAL_USERS: TaavApprovalUser[] = [
  { id: '1', name: 'بلب بلبل' },
  { id: '2', name: 'زهرا قیفلی' },
];

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div data-taav-theme="light" className="flex w-full flex-col items-center justify-center gap-4 py-4">
      {children}
    </div>
  );
}

function InlineDialogPreview({
  title,
  description,
  confirmLabel,
  children,
  selection = false,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  children: ReactNode;
  selection?: boolean;
}) {
  return (
    <article
      aria-label={title}
      className={`flex w-[min(350px,100%)] flex-col overflow-hidden rounded-[30px] border-0 bg-[#f6f7f8] text-right text-[#55585b] shadow-[0_18px_38px_rgba(20,24,26,0.22)] ${
        selection ? 'h-[516px]' : ''
      }`}
    >
      <header className="grid shrink-0 gap-[12px] px-[32px] pb-[14px] pt-[30px] text-center">
        <h3 className="m-0 text-center text-[21px] font-bold leading-[1.45] text-[#55585b]">{title}</h3>
        {description ? (
          <p className="m-0 text-center text-[12px] font-normal leading-[1.65] text-[#686b6e]">{description}</p>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-[32px] pb-[30px]">{children}</div>
      <footer className="flex min-h-[84px] shrink-0 flex-wrap items-center justify-start gap-[30px] bg-[#fafbfc] px-[32px] py-[22px] text-[#009b9f] shadow-[0_-5px_12px_rgba(42,49,52,0.05)]">
        <button type="button" className="min-h-[32px] border-0 bg-transparent p-0 text-[15px] font-bold text-[#009b9f]">
          {confirmLabel}
        </button>
        <button type="button" className="min-h-[32px] border-0 bg-transparent p-0 text-[15px] font-bold text-[#009b9f]">
          لغو
        </button>
      </footer>
    </article>
  );
}

export default function ComponentsDialogPage() {
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [technicalTitle, setTechnicalTitle] = useState('');
  const [technicalDescription, setTechnicalDescription] = useState('');

  const [plateOpen, setPlateOpen] = useState(false);
  const [mainPlate, setMainPlate] = useState('');
  const [subPlate, setSubPlate] = useState('');
  const [subPlateValues, setSubPlateValues] = useState<string[]>(['۱۴', '۱۲']);

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [users, setUsers] = useState<TaavApprovalUser[]>(INITIAL_USERS);
  const [searchValue, setSearchValue] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>();

  const addLocalUser = () => {
    const nextUserNumber = users.length + 1;
    setUsers((current) => [
      ...current,
      { id: String(nextUserNumber), name: `کاربر جدید ${nextUserNumber}` },
    ]);
  };

  return (
    <div dir="rtl" className="text-right">
      <DocPageShell
        breadcrumbs={[
          { label: 'خانه', href: '/' },
          { label: 'Components', href: '/business-components' },
          { label: 'دیالوگ' },
        ]}
      >
        <DocPageHeader
          eyebrow="Components"
          title="دیالوگ"
          description="کامپوننت پایه برای نمایش پنجره محاوره‌ای با عنوان، توضیح، محتوای قابل تزریق، دکمه‌های پایین، overlay و حالت‌های مختلف فرم."
          importCode={`import { TaavDialog } from '@repo/ui/taav/overlays';`}
        />

        <DocSection title="کامپوننت اصلی">
          <PreviewFrame>
            <InlineDialogPreview
              title="مشخصات فنی پروژه"
              description="عنوان را انتخاب کرده و توضیح فنی مربوط به آن را وارد کنید. از نکته‌های پیشنهادی برای راحتی و هماهنگی در ثبت استفاده کنید."
              confirmLabel="تایید"
            >
              <TaavProjectTechnicalInfoForm
                titleValue={technicalTitle}
                descriptionValue={technicalDescription}
                onTitleChange={setTechnicalTitle}
                onDescriptionChange={setTechnicalDescription}
              />
            </InlineDialogPreview>
            <TaavButton
              onClick={() => setTechnicalOpen(true)}
              variant="outline"
              unsafeClassName="!h-[40px] !rounded-[8px] !border-[#009b9f] !bg-white !px-5 !text-[#009b9f] hover:!bg-[#f0fafb]"
            >
              مشاهده حالت Overlay
            </TaavButton>
          </PreviewFrame>
        </DocSection>

        <TaavDivider unsafeClassName="my-6" />

        <DocSection title="توکن پلاک">
          <PreviewFrame>
            <InlineDialogPreview
              title="پلاک های اصلی و فرعی"
              description="پلاک های اصلی و فرعی را اینجا ثبت کنید."
              confirmLabel="ثبت"
            >
              <TaavPlateForm
                mainPlateValue={mainPlate}
                subPlateValue={subPlate}
                subPlateValues={subPlateValues}
                onMainPlateChange={setMainPlate}
                onSubPlateChange={setSubPlate}
                onSubPlateValuesChange={setSubPlateValues}
              />
            </InlineDialogPreview>
            <TaavButton
              variant="outline"
              onClick={() => setPlateOpen(true)}
              unsafeClassName="!h-[40px] !rounded-[8px] !border-[#009b9f] !bg-white !px-5 !text-[#009b9f] hover:!bg-[#f0fafb]"
            >
              مشاهده حالت Overlay
            </TaavButton>
          </PreviewFrame>
        </DocSection>

        <TaavDivider unsafeClassName="my-6" />

        <DocSection title="توکن تاییدکننده">
          <PreviewFrame>
            <InlineDialogPreview
              title="تاییدکننده نهایی کل فرآیند"
              confirmLabel="تایید"
              selection
            >
              <TaavApprovalUserForm
                users={users}
                selectedUserId={selectedUserId}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onUserSelect={setSelectedUserId}
                onAddUser={addLocalUser}
              />
            </InlineDialogPreview>
            <TaavButton
              variant="outline"
              onClick={() => setApprovalOpen(true)}
              unsafeClassName="!h-[40px] !rounded-[8px] !border-[#009b9f] !bg-white !px-5 !text-[#009b9f] hover:!bg-[#f0fafb]"
            >
              مشاهده حالت Overlay
            </TaavButton>
          </PreviewFrame>
        </DocSection>

        <DocSection title="ویژگی‌های کامپوننت">
          <DocPropsTable rows={DIALOG_PROPS} />
        </DocSection>

        <TaavDialog
          open={technicalOpen}
          onOpenChange={setTechnicalOpen}
          title="مشخصات فنی پروژه"
          description="عنوان را انتخاب کرده و توضیح فنی مربوط به آن را وارد کنید. از نکته‌های پیشنهادی برای راحتی و هماهنگی در ثبت استفاده کنید."
          confirmLabel="تایید"
          cancelLabel="لغو"
          variant="form"
          footerVariant="separated"
          onConfirm={() => setTechnicalOpen(false)}
        >
          <TaavProjectTechnicalInfoForm
            titleValue={technicalTitle}
            descriptionValue={technicalDescription}
            onTitleChange={setTechnicalTitle}
            onDescriptionChange={setTechnicalDescription}
          />
        </TaavDialog>

        <TaavDialog
          open={plateOpen}
          onOpenChange={setPlateOpen}
          title="پلاک های اصلی و فرعی"
          description="پلاک های اصلی و فرعی را اینجا ثبت کنید."
          confirmLabel="ثبت"
          cancelLabel="لغو"
          variant="form"
          footerVariant="separated"
          onConfirm={() => setPlateOpen(false)}
        >
          <TaavPlateForm
            mainPlateValue={mainPlate}
            subPlateValue={subPlate}
            subPlateValues={subPlateValues}
            onMainPlateChange={setMainPlate}
            onSubPlateChange={setSubPlate}
            onSubPlateValuesChange={setSubPlateValues}
          />
        </TaavDialog>

        <TaavDialog
          open={approvalOpen}
          onOpenChange={setApprovalOpen}
          title="تاییدکننده نهایی کل فرآیند"
          confirmLabel="تایید"
          cancelLabel="لغو"
          variant="selection"
          footerVariant="separated"
          onConfirm={() => setApprovalOpen(false)}
        >
          <TaavApprovalUserForm
            users={users}
            selectedUserId={selectedUserId}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onUserSelect={setSelectedUserId}
            onAddUser={addLocalUser}
          />
        </TaavDialog>
      </DocPageShell>
    </div>
  );
}
