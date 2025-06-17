import React, { useState, ReactNode } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

export type ExampleEntry = {
  element: string;
  elementUrl: string;
  value: string;
  detail?: string;
};

// Props for original format (structured data)
type ExampleTableDataProps = {
  entries: ExampleEntry[];
  caption?: string;
  children?: never;
};

// Props for new format (React children for direct use in MDX)
type ExampleTableChildrenProps = {
  entries?: never;
  caption?: string;
  children: ReactNode;
};

// Union type to support both formats
type ExampleTableProps = ExampleTableDataProps | ExampleTableChildrenProps;

// Component to handle individual table rows with proper hook usage
function ExampleTableRow({
  entry,
  index,
  expandedDetailId,
  toggleDetail
}: {
  entry: ExampleEntry;
  index: number;
  expandedDetailId: number | null;
  toggleDetail: (index: number) => void;
}) {
  const processedUrl = useBaseUrl(entry.elementUrl);

  return (
    <React.Fragment key={index}>
      <tr id={`row-${index}`}>
        <td className={styles.elementColumn}>
          <a
            href={processedUrl}
            className="linkMenuElement"
          >
            {entry.element}
          </a>
        </td>
        <td className={styles.valueColumn}>
          {entry.value}
        </td>
        <td className={styles.detailColumn}>
          {entry.detail && (
            <button
              className={styles.detailTrigger}
              onClick={() => toggleDetail(index)}
              aria-expanded={expandedDetailId === index}
              aria-controls={`details-${index}`}
            >
              ⁇⁇
            </button>
          )}
        </td>
      </tr>
      {entry.detail && expandedDetailId === index && (
        <tr className={styles.detailRow}>
          <td colSpan={3} className={styles.detailCell}>
            <div className={styles.detailContent}>
              {entry.detail}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export function ExampleTable(props: ExampleTableProps): React.JSX.Element {
  const [expandedDetailId, setExpandedDetailId] = useState<number | null>(null);

  const toggleDetail = (index: number) => {
    setExpandedDetailId(expandedDetailId === index ? null : index);
  };

  // Check if using children or entries format
  const usingChildrenFormat = 'children' in props && Boolean(props.children);

  // Get entries if not using children format
  const entries = usingChildrenFormat ? [] : (props as ExampleTableDataProps).entries;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.exampleTable}>
        {!usingChildrenFormat && (
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
        )}
        <tbody>
          {usingChildrenFormat ? (
            props.children
          ) : (
            entries.map((entry, index) => (
              <ExampleTableRow
                key={index}
                entry={entry}
                index={index}
                expandedDetailId={expandedDetailId}
                toggleDetail={toggleDetail}
              />
            ))
          )}
        </tbody>
      </table>
      {props.caption && (
        <div className={styles.caption}>
          {props.caption}
        </div>
      )}
    </div>
  );
}