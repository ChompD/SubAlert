import styles from './DataTable.module.css'

// The table view of a chart: a real <table>, so a screen reader can move
// around it by row and column. columns: [{ key, label, numeric }], rows:
// objects with those keys, already formatted as text.
export default function DataTable({ caption, columns, rows }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.numeric ? styles.numeric : ''}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column, i) =>
                i === 0 ? (
                  <th key={column.key} scope="row">
                    {row[column.key]}
                  </th>
                ) : (
                  <td key={column.key} className={column.numeric ? styles.numeric : ''}>
                    {row[column.key]}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
