import { openmrsFetch, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useStockBatches(uuid: string) {
  const session = useSession();
  const formattedUuid = uuid ? uuid.split('/')[1] : '';
  const url = `/ws/rest/v1/stockmanagement/stockiteminventory?v=default&totalCount=true&drugUuid=${formattedUuid}
    &includeStrength=1&includeConceptRefIds=1&groupBy=LocationStockItemBatchNo&includeBatchNo=1&dispenseLocationUuid=${session?.sessionLocation.uuid}`;
  const { data, error, isValidating, isLoading } = useSWR<{ data: any }, Error>(uuid ? url : null, openmrsFetch);
  return {
    stockBatches: data ? data.data : [],
    isLoadingStock: isLoading,
    isError: error,
    isValidatingStock: isValidating,
  };
}
