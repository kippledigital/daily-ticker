'use client'

import { useState } from 'react'
import { X, Calculator } from 'lucide-react'
import { ROICalculator } from './roi-calculator'

interface ROICalculatorModalProps {
  triggerText?: string
  triggerClassName?: string
  showIcon?: boolean
}

export function ROICalculatorModal({
  triggerText = "See Value Calculator",
  triggerClassName = "",
  showIcon = true
}: ROICalculatorModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={triggerClassName || "inline-flex items-center gap-2 text-[#00ff88] hover:text-[#00dd77] transition-colors"}
      >
        {showIcon && <Calculator className="h-4 w-4" />}
        {triggerText}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#0B1E32] border border-[#1a3a52] rounded-2xl shadow-2xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-[#1a3a52] hover:bg-[#244a62] text-gray-300 hover:text-white rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Calculator Content - Compact padding */}
            <div className="p-6 md:p-8">
              <ROICalculator isModal={true} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
