import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  DataTable,
  InlineLoading,
  Layer,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Button,
} from '@carbon/react';
import {
  useLayoutType,
  isDesktop,
  useConfig,
  usePagination,
  ErrorState,
  navigate,
  showModal,
} from '@openmrs/esm-framework';
import { EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';
import styles from './billable-services.scss';
import { useTranslation } from 'react-i18next';
import { useBillableServices } from './billable-service.resource';
import { ArrowRight } from '@carbon/react/icons';

const BillableServices = () => {
  const { t } = useTranslation();
  const { billableServices, isLoading, isValidating, error, mutate } = useBillableServices();
  const layout = useLayoutType();
  const config = useConfig();
  const [searchString, setSearchString] = useState('');
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const pageSizes = config?.billableServices?.pageSizes ?? [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(config?.billableServices?.pageSize ?? 10);

  //creating service state
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayHeader, setOverlayTitle] = useState('');

  const headerData = [
    {
      header: t('serviceName', 'Service Name'),
      key: 'serviceName',
    },
    {
      header: t('shortName', 'Short Name'),
      key: 'shortName',
    },
    {
      header: t('serviceType', 'Service Type'),
      key: 'serviceType',
    },
    {
      header: t('status', 'Service Status'),
      key: 'status',
    },
    {
      header: t('prices', 'Prices'),
      key: 'prices',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const searchResults = useMemo(() => {
    if (billableServices !== undefined && billableServices.length > 0) {
      if (searchString && searchString.trim() !== '') {
        const search = searchString.toLowerCase();
        return billableServices?.filter((service) =>
          Object.entries(service).some(([header, value]) => {
            return header === 'uuid' ? false : `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }
    return billableServices;
  }, [searchString, billableServices]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  let rowData = [];
  if (results) {
    results.forEach((service, index) => {
      const s = {
        id: `${index}`,
        uuid: service.uuid,
        serviceName: service.name,
        shortName: service.shortName,
        serviceType: service.serviceType.display,
        status: service.serviceStatus,
        prices: '--',
        actions: '--',
      };
      let cost = '';
      service.servicePrices.forEach((price) => {
        cost += `${price.name} (${price.price}) `;
      });
      s.prices = cost;
      rowData.push(s);
    });
  }

  // const rowData = results?.map((service, index) => ({
  //   id: `${index}`,
  //   uuid: service.uuid,
  //   serviceName: service.name,
  //   shortName: service.shortName,
  //   serviceType: service.serviceType.display,
  //   status: service.serviceStatus,
  //   prices: service.servicePrices[0].name + service.servicePrices[0].price,
  //   actions: '--',
  // }));

  const handleSearch = useCallback(
    (e) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

  const handleBulkImportClick = useCallback(() => {
    const dispose = showModal('billabl-e-services-bulk-import', {
      closeModal: () => dispose(),
    });
  }, []);

  if (isLoading) {
    <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }
  if (error) {
    <ErrorState headerTitle={t('billableService', 'Billable Service')} error={error} />;
  }
  if (billableServices.length === 0) {
    <EmptyState
      displayText={t('billableService', 'Billable Service')}
      headerTitle={t('billableService', 'Billable Service')}
    />;
  }

  return (
    <>
      <div className={styles.metricsContainer}>
        <Button
          className={styles.actionBtn}
          kind="tertiary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={() => {
            navigate({ to: window.getOpenmrsSpaBase() + 'billable-services/add-service' });
          }}
          iconDescription={t('addNewBillableService', 'Add new billable service')}>
          {t('addNewService', 'Add new service')}
        </Button>
        <Button
          className={styles.actionBtn}
          kind="ghost"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={handleBulkImportClick}
          iconDescription={t('bulkImport', 'Bulk Import')}>
          {t('bulkImport', 'Bulk Import')}
        </Button>
      </div>

      {billableServices?.length > 0 ? (
        <div className={styles.serviceContainer}>
          <FilterableTableHeader
            handleSearch={handleSearch}
            isValidating={isValidating}
            layout={layout}
            responsiveSize={responsiveSize}
            t={t}
          />
          <DataTable
            isSortable
            rows={rowData}
            headers={headerData}
            size={responsiveSize}
            useZebraStyles={rowData?.length > 1 ? true : false}>
            {({ rows, headers, getRowProps, getTableProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="service list">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.id}
                        {...getRowProps({
                          row,
                        })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {searchResults?.length === 0 && (
            <div className={styles.filterEmptyState}>
              <Layer level={0}>
                <Tile className={styles.filterEmptyStateTile}>
                  <p className={styles.filterEmptyStateContent}>
                    {t('noMatchingServicesToDisplay', 'No matching services to display')}
                  </p>
                  <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
                </Tile>
              </Layer>
            </div>
          )}
          {paginated && (
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={pageSize}
              pageSizes={pageSizes}
              totalItems={searchResults?.length}
              className={styles.pagination}
              size={responsiveSize}
              onChange={({ pageSize: newPageSize, page: newPage }) => {
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                }
                if (newPage !== currentPage) {
                  goTo(newPage);
                }
              }}
            />
          )}
        </div>
      ) : (
        <Layer className={styles.emptyStateContainer}>
          <Tile className={styles.tile}>
            <div className={styles.illo}>
              <EmptyDataIllustration />
            </div>
            <p className={styles.content}>There are no services to display.</p>
          </Tile>
        </Layer>
      )}
    </>
  );
};

function FilterableTableHeader({ layout, handleSearch, isValidating, responsiveSize, t }) {
  return (
    <>
      <div className={styles.headerContainer}>
        <div
          className={classNames({
            [styles.tabletHeading]: !isDesktop(layout),
            [styles.desktopHeading]: isDesktop(layout),
          })}>
          <h4>{t('servicesList', 'Services list')}</h4>
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <Search
        labelText=""
        placeholder={t('filterTable', 'Filter table')}
        onChange={handleSearch}
        size={responsiveSize}
      />
    </>
  );
}
export default BillableServices;
