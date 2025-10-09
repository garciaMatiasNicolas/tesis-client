import React from "react";

const Table = ({ columns, data, renderCell }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    {columns.map((col, idx) => (
                        <th
                        key={idx}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                        {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                        {columns.map((col, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            {renderCell ? renderCell(col, row, colIdx) : row[col]}
                        </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default Table;