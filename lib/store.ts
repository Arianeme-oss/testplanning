"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Booking {
  id: string
  roomId: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: string
  description: string
  isRecurring?: boolean
  recurrenceEndDate?: string
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly"
}

export interface TrainingType {
  id: string
  name: string
}

export interface Room {
  id: string
  name: string
  type: "training" | "office"
}

export interface Leave {
  id: string
  referentId: string // ID du référent associé au bureau
  startDate: string
  endDate: string
  reason: string
  title: string // Ajout du titre manquant
}

interface BookingStore {
  bookings: Booking[]
  selectedRoom: string
  selectedRooms: string[]
  customTrainingTypes: TrainingType[]
  rooms: Room[]
  leaves: Leave[]
  addBooking: (booking: Booking) => void
  removeBooking: (id: string) => void
  setSelectedRoom: (roomId: string) => void
  setSelectedRooms: (roomIds: string[]) => void
  toggleSelectedRoom: (roomId: string) => void
  addTrainingType: (type: TrainingType) => void
  removeTrainingType: (id: string) => void
  addRoom: (room: Room) => void
  updateRoom: (id: string, updates: Partial<Room>) => void
  removeRoom: (id: string) => void
  addLeave: (leave: Leave) => void
  updateLeave: (id: string, updates: Partial<Leave>) => void
  removeLeave: (id: string) => void
  isRoomAvailable: (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ) => boolean
}

// Default training types
const DEFAULT_TRAINING_TYPES: TrainingType[] = [
  { id: "1", name: "IDENTIFIER SES POTENTIELS" },
  { id: "2", name: "PREPARATION A L'EMPLOI" },
  { id: "3", name: "CONNAISSANCES DU MONDE DE L'ENTREPRISE" },
  { id: "4", name: "NUMERIQUE" },
  { id: "5", name: "SAVOIRS DE BASE" },
  { id: "6", name: "FAVORISER L'AGENTIVITE" },
  { id: "7", name: "AUTRE" },
]

// Default rooms
const DEFAULT_ROOMS: Room[] = [
  { id: "salle1", name: "Salle 1", type: "training" },
  { id: "salle2", name: "Salle 2", type: "training" },
  { id: "kathy", name: "Bureau Kathy", type: "office" },
  { id: "yvan", name: "Bureau Yvan", type: "office" },
  { id: "siham", name: "Bureau Siham", type: "office" },
  { id: "kim", name: "Bureau Kim", type: "office" },
  { id: "valerie", name: "Bureau Valérie", type: "office" },
  { id: "samira", name: "Bureau Samira", type: "office" },
  { id: "laure", name: "Bureau Laure", type: "office" },
]

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],
      selectedRoom: "salle1",
      selectedRooms: [],
      customTrainingTypes: DEFAULT_TRAINING_TYPES,
      rooms: DEFAULT_ROOMS,
      leaves: [],

      addBooking: (booking) => {
        set((state) => {
          // Handle recurring bookings
          if (booking.isRecurring && booking.recurrenceEndDate) {
            const newBookings = [...state.bookings]
            const startDate = new Date(booking.date)
            const endDate = new Date(booking.recurrenceEndDate)

            // Create recurring instances
            const currentDate = new Date(startDate)
            while (currentDate <= endDate) {
              const bookingDate = currentDate.toISOString().split("T")[0]

              // Vérifier s'il n'y a pas déjà une réservation pour cette date et cette salle
              const hasConflict = state.bookings.some(
                (existingBooking) =>
                  existingBooking.roomId === booking.roomId &&
                  existingBooking.date === bookingDate &&
                  ((existingBooking.startTime <= booking.startTime && existingBooking.endTime > booking.startTime) ||
                    (existingBooking.startTime < booking.endTime && existingBooking.endTime >= booking.endTime) ||
                    (existingBooking.startTime >= booking.startTime && existingBooking.endTime <= booking.endTime)),
              )

              // Vérifier si le référent est en congé (pour les bureaux)
              const room = state.rooms.find((r) => r.id === booking.roomId)
              let isOnLeave = false

              if (room?.type === "office") {
                isOnLeave = state.leaves.some(
                  (leave) =>
                    leave.referentId === booking.roomId &&
                    new Date(leave.startDate) <= currentDate &&
                    new Date(leave.endDate) >= currentDate,
                )
              }

              // Ajouter la réservation seulement s'il n'y a pas de conflit et pas de congé
              if (!hasConflict && !isOnLeave) {
                newBookings.push({
                  ...booking,
                  id: `${booking.id}-${bookingDate}`,
                  date: bookingDate,
                })
              }

              // Increment date based on recurrence pattern
              if (booking.recurrencePattern === "daily") {
                currentDate.setDate(currentDate.getDate() + 1)
              } else if (booking.recurrencePattern === "weekly") {
                currentDate.setDate(currentDate.getDate() + 7)
              } else if (booking.recurrencePattern === "monthly") {
                currentDate.setMonth(currentDate.getMonth() + 1)
              } else if (booking.recurrencePattern === "yearly") {
                currentDate.setFullYear(currentDate.getFullYear() + 1)
              }
            }

            return { bookings: newBookings }
          }

          // Handle single booking
          return { bookings: [...state.bookings, booking] }
        })
      },

      removeBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.id !== id && !booking.id.startsWith(`${id}-`)),
        })),

      setSelectedRoom: (roomId) => set({ selectedRoom: roomId }),

      setSelectedRooms: (roomIds) => set({ selectedRooms: roomIds }),

      toggleSelectedRoom: (roomId) =>
        set((state) => {
          if (state.selectedRooms.includes(roomId)) {
            return {
              selectedRooms: state.selectedRooms.filter((id) => id !== roomId),
            }
          } else {
            return {
              selectedRooms: [...state.selectedRooms, roomId],
            }
          }
        }),

      addTrainingType: (type) =>
        set((state) => ({
          customTrainingTypes: [...state.customTrainingTypes, type],
        })),

      removeTrainingType: (id) =>
        set((state) => ({
          customTrainingTypes: state.customTrainingTypes.filter((type) => type.id !== id),
        })),

      addRoom: (room) =>
        set((state) => ({
          rooms: [...state.rooms, room],
        })),

      updateRoom: (id, updates) =>
        set((state) => ({
          rooms: state.rooms.map((room) => (room.id === id ? { ...room, ...updates } : room)),
        })),

      removeRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== id),
          // If the deleted room was selected, select another room
          selectedRoom:
            state.selectedRoom === id ? state.rooms.find((r) => r.id !== id)?.id || "salle1" : state.selectedRoom,
          selectedRooms: state.selectedRooms.filter((roomId) => roomId !== id),
        })),

      addLeave: (leave) =>
        set((state) => ({
          leaves: [...state.leaves, leave],
        })),

      updateLeave: (id, updates) =>
        set((state) => ({
          leaves: state.leaves.map((leave) => (leave.id === id ? { ...leave, ...updates } : leave)),
        })),

      removeLeave: (id) =>
        set((state) => ({
          leaves: state.leaves.filter((leave) => leave.id !== id),
        })),

      isRoomAvailable: (roomId, date, startTime, endTime, excludeBookingId) => {
        const state = get()

        // Vérifier s'il y a des réservations existantes qui se chevauchent
        const hasConflict = state.bookings.some((booking) => {
          // Ignorer la réservation en cours de modification
          if (excludeBookingId && (booking.id === excludeBookingId || booking.id.startsWith(`${excludeBookingId}-`))) {
            return false
          }

          return (
            booking.roomId === roomId &&
            booking.date === date &&
            ((booking.startTime <= startTime && booking.endTime > startTime) ||
              (booking.startTime < endTime && booking.endTime >= endTime) ||
              (booking.startTime >= startTime && booking.endTime <= endTime))
          )
        })

        if (hasConflict) {
          return false
        }

        // Vérifier si c'est un bureau et si le référent est en congé
        const room = state.rooms.find((r) => r.id === roomId)
        if (room?.type === "office") {
          const bookingDate = new Date(date)

          const referentOnLeave = state.leaves.some((leave) => {
            if (leave.referentId === roomId) {
              const leaveStartDate = new Date(leave.startDate)
              const leaveEndDate = new Date(leave.endDate)
              return bookingDate >= leaveStartDate && bookingDate <= leaveEndDate
            }
            return false
          })

          if (referentOnLeave) {
            return false
          }
        }

        return true
      },
    }),
    {
      name: "booking-storage",
    },
  ),
)

