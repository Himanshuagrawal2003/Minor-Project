import React from 'react';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTable({ columns, data, className }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm glass", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/20 transition-colors last:border-0">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-foreground">
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple Pagination Mock UI */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border/50 bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Showing 1 to {data.length} entries
          </span>
          <div className="flex gap-1">
            <button className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
