import { BookingList } from "@/components/booking-list"
import { RoomSelector } from "@/components/room-selector"

export default function PlanningPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Planning des Réservations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RoomSelector />
        </div>
        <div className="lg:col-span-2">
          <BookingList />
        </div>
      </div>
    </main>
  )
}

