'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Contract, ContractFormData, ContractStatus, FilterState } from '../types/contract';
import { getContractsList } from '../lib/contractDraftClient';

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
  loading: boolean;
  setActiveTab: (tab: ContractStatus) => void;
  setSearchQuery: (q: string) => void;
  setFilters: (f: FilterState) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  saveContract: (data: ContractFormData, status: ContractStatus, id?: string) => Contract;
  getContractById: (id: string) => Contract | undefined;
  deleteContract: (id: string) => void;
}

export function useContracts(): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContractStatus>('finalized');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getContractsList();
      setContracts(result as Contract[]);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const hasFinalized = contracts.some((contract) => contract.status === 'finalized');
    const hasDraft = contracts.some((contract) => contract.status === 'draft');

    if (!hasFinalized && hasDraft && activeTab === 'finalized') {
      setActiveTab('draft');
    }
  }, [contracts, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const finalizedCount = contracts.filter((contract) => contract.status === 'finalized').length;
  const draftCount = contracts.filter((contract) => contract.status === 'draft').length;

  const filteredContracts = contracts.filter((contract) => {
    if (contract.status !== activeTab) return false;

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      const contractNumber = contract.data.subject.contractNumber?.toLowerCase() ?? '';
      const partyOneNames = (contract.data.parties.partyOne ?? []).map((party) => party.name?.toLowerCase() ?? '').join(' ');
      const partyTwoNames = (contract.data.parties.partyTwo ?? []).map((party) => party.name?.toLowerCase() ?? '').join(' ');

      if (!contractNumber.includes(query) && !partyOneNames.includes(query) && !partyTwoNames.includes(query)) {
        return false;
      }
    }

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

  const getContractById = useCallback(
    (id: string) => contracts.find((contract) => contract.id === id),
    [contracts],
  );

  return {
    contracts,
    filteredContracts,
    filters,
    searchQuery,
    activeTab,
    finalizedCount,
    draftCount,
    loading,
    setActiveTab,
    setSearchQuery,
    setFilters,
    clearFilters,
    refresh,
    saveContract: () => {
      throw new Error('ذخیره قرارداد از این مسیر پشتیبانی نمی‌شود.');
    },
    getContractById,
    deleteContract: () => {
      throw new Error('حذف قرارداد از این مسیر پشتیبانی نمی‌شود.');
    },
  };
}
