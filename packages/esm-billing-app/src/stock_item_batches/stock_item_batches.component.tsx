import React, { useEffect, useState } from 'react';
import { useStockBatches } from './stock_item.resource';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { ComboBox, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './stock_item_batches.scss';

type StockItemBatchesProps = {
  dispenseItemUuid: string;
  setStockItem?: (value: any) => void;
};

const StockItemBatches: React.FC<StockItemBatchesProps> = ({ dispenseItemUuid, setStockItem }) => {
  const { stockBatches, isLoadingStock, isValidatingStock } = useStockBatches(dispenseItemUuid);
  const [itemStockBatches, setItemStockBatches] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const stockBatchesOptions = [];

    if (stockBatches.results) {
      stockBatches.results.forEach((element) => {
        stockBatchesOptions.push({
          stockItemUuid: element.stockItemUuid,
          itemLocation: element.locationUuid,
          quantityUoMUuid: element.quantityUoMUuid,
          batchUuid: element.stockBatchUuid,
          text: `${element.batchNumber} | Expires ${formatDatetime(parseDate(element.expiration), {
            mode: 'standard',
          })} | Qty ${element.quantity} ${element.quantityUoM}  `,
        });
      });
    }
    setItemStockBatches(stockBatchesOptions);
  }, [stockBatches]);

  if (isLoadingStock) {
    return (
      <section className={styles.container}>
        <InlineLoading status="active" iconDescription="Loading" description="Loading stock inventory item..." />
      </section>
    );
  }
  return (
    <div>
      <ComboBox
        id="batchNumber"
        items={itemStockBatches}
        initialSelectedItem={itemStockBatches[0]}
        titleText={t('batchNumber', 'Batch Numbers')}
        itemToString={(item) => item?.text}
        onChange={({ selectedItem }) => {
          setStockItem(selectedItem);
        }}
        required
      />
    </div>
  );
};

export default StockItemBatches;
