import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
      <div className="hidden sm:block text-sm text-slate-500">
        {totalItems ? (
          <>
            Menampilkan <span className="font-medium text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> sampai <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-medium text-slate-900">{totalItems}</span> hasil
          </>
        ) : (
          <>Halaman {currentPage} dari {totalPages}</>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-slate-200"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Sebelum
        </Button>
        <div className="hidden sm:flex items-center space-x-1">
          {pages.map((p, i) => (
            p === "..." ? (
              <span key={i} className="px-2 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>
            ) : (
              <Button
                key={i}
                variant={p === currentPage ? "orange" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${p === currentPage ? 'font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => typeof p === 'number' && onPageChange(p)}
              >
                {p}
              </Button>
            )
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-slate-200"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Lanjut <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
