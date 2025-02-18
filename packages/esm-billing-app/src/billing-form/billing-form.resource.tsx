import useSWR from 'swr';
import { LineItem } from '../types';
import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';

export const useBillableItems = () => {
  const url = `/ws/rest/v1/stockmanagement/stockitem?v=default&limit=10&totalCount=true&isDrug=false`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);
  return {
    lineItems: data?.data?.results ?? [],
    isLoading,
    error,
  };
};

export const useCashPoint = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);

  return { isLoading, error, cashPoints: data?.data?.results ?? [] };
};

export const createPatientBill = (payload) => {
  const postUrl = `/ws/rest/v1/cashier/bill`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};
