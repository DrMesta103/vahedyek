import type { TaaviaBrandInfoStatus, TaaviaBrandInfoType } from '@/app/lib/prisma-client';

export type BrandInfoType = TaaviaBrandInfoType;
export type BrandInfoStatus = TaaviaBrandInfoStatus;

export type BrandInfoMediaDto = {
  id: string;
  extension: string;
  size: number;
  previewUrl: string;
  downloadUrl: string;
};

export type BrandInfoDto = {
  id: string;
  type: BrandInfoType;
  title: string | null;
  textContent: string | null;
  media: BrandInfoMediaDto | null;
  status: BrandInfoStatus;
  displayOrder: number;
  revision: string;
  createdBy: string;
  updatedBy: string;
  archivedAt: string | null;
  archivedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BrandInfoFilters = {
  status?: BrandInfoStatus;
  type?: BrandInfoType;
  search?: string;
};

export type BrandInfoMutationResult = {
  item: BrandInfoDto;
  changed: boolean;
};
