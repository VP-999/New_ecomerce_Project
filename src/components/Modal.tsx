"use client"

import type React from "react"
import type { ReactNode } from "react"
import { XMarkIcon } from "./icons"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto relative border border-border">
        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <XMarkIcon />
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
