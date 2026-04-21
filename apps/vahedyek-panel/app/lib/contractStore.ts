import type { Contract, ContractFormData, ContractStatus } from '../types/contract';

const STORAGE_KEY = 'contracts';

export function getContracts(): Contract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Contract[];
  } catch {
    return [];
  }
}

export function saveContract(
  data: ContractFormData,
  status: ContractStatus,
  id?: string
): Contract {
  const contracts = getContracts();
  const now = new Date().toISOString();

  if (id) {
    const index = contracts.findIndex((c) => c.id === id);
    if (index !== -1) {
      const updated: Contract = {
        ...contracts[index],
        status,
        updatedAt: now,
        data,
      };
      contracts[index] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
      return updated;
    }
  }

  const newContract: Contract = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),
    status,
    createdAt: now,
    updatedAt: now,
    data,
  };

  contracts.push(newContract);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  return newContract;
}

export function getContractById(id: string): Contract | undefined {
  return getContracts().find((c) => c.id === id);
}

export function deleteContract(id: string): void {
  const contracts = getContracts().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}
