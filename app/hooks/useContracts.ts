'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Contract, ContractFormData, ContractStatus, FilterState } from '../types/contract';
import {
  getContracts,
  saveContract as storeSaveContract,
  getContractById as storeGetContractById,
  deleteContract as storeDeleteContract,
} from '../lib/contractStore';

const EMPTY_FILTERS: FilterState = {
  contractType: null,
  dateFrom: null,
  dateTo: null,
  blockId: null,
  unitId: null,
};

export interface UseContractsReturn {
  contracts: Contract[];
  filteredContracts: Contract[];
  filters: FilterState;
  searchQuery: string;
  activeTab: ContractStatus;
  finalizedCount: number;
  draftCount: number;
  setActiveTab: (tab: ContractStatus) => void;
  setSearchQuery: (q: string) => void;
  setFilters: (f: FilterState) => void;
  clearFilters: () => void;
  saveContract: (data: ContractFormData, status: ContractStatus, id?: string) => Contract;
  getContractById: (id: string) => Contract | undefined;
  deleteContract: (id: string) => void;
}

export function useContracts(): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeTab, setActiveTab] = useState<ContractStatus>('finalized');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  // بارگذاری اولیه از store
  useEffect(() => {
    setContracts(getContracts());
  }, []);

  // debounce 250ms برای searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refresh = useCallback(() => {
    setContracts(getContracts());
  }, []);

  const saveContract = useCallback(
    (data: ContractFormData, status: ContractStatus, id?: string): Contract => {
      const result = storeSaveContract(data, status, id);
      refresh();
      return result;
    },
    [refresh]
  );

  const deleteContract = useCallback(
    (id: string): void => {
      storeDeleteContract(id);
      refresh();
    },
    [refresh]
  );

  const getContractById = useCallback(
    (id: string): Contract | undefined => storeGetContractById(id),
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  // محاسبه شمارنده‌ها
  const finalizedCount = contracts.filter((c) => c.status === 'finalized').length;
  const draftCount = contracts.filter((c) => c.status === 'draft').length;

  // منطق فیلتر
  const filteredContracts = contracts.filter((contract) => {
    // ۱. فیلتر بر اساس تب فعال
    if (contract.status !== activeTab) return false;

    // ۲. جستجوی متنی
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      const contractNumber = contract.data.subject.contractNumber?.toLowerCase() ?? '';
      const partyOneNames = (contract.data.parties.partyOne ?? [])
        .map((p) => p.name?.toLowerCase() ?? '')
        .join(' ');
      const partyTwoNames = (contract.data.parties.partyTwo ?? [])
        .map((p) => p.name?.toLowerCase() ?? '')
        .join(' ');

      const matchesSearch =
        contractNumber.includes(q) ||
        partyOneNames.includes(q) ||
        partyTwoNames.includes(q);

      if (!matchesSearch) return false;
    }

    // ۳. فیلترهای اضافه
    if (filters.contractType && contract.data.subject.contractType !== filters.contractType) {
      return false;
    }

    if (filters.dateFrom && contract.data.subject.contractDate < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && contract.data.subject.contractDate > filters.dateTo) {
      return false;
    }

    if (filters.blockId && contract.data.subject.blockId !== filters.blockId) {
      return false;
    }

    if (filters.unitId && contract.data.subject.unitId !== filters.unitId) {
      return false;
    }

    return true;
  });

  return {
    contracts,
    filteredContracts,
    filters,
    searchQuery,
    activeTab,
    finalizedCount,
    draftCount,
    setActiveTab,
    setSearchQuery,
    setFilters,
    clearFilters,
    saveContract,
    getContractById,
    deleteContract,
  };
}
