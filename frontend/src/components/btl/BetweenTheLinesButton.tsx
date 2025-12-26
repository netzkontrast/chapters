"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BetweenTheLinesModal } from "./BetweenTheLinesModal"
import { useUser } from "@/hooks/useUser"

interface BetweenTheLinesButtonProps {
  bookId: string
  bookUserId: string | number
  bookTitle: string
}

export function BetweenTheLinesButton({
  bookId,
  bookUserId,
  bookTitle,
}: BetweenTheLinesButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: currentUser } = useUser()

  // Don't show BTL button for own book
  if (!currentUser || currentUser.user_id === parseInt(bookUserId.toString())) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="text-sm"
      >
        Between the Lines
      </Button>

      <BetweenTheLinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipientId={parseInt(bookUserId.toString())}
        bookTitle={bookTitle}
      />
    </>
  )
}
