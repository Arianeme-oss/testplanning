"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBookingStore, type Room } from "@/lib/store"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function RoomManager() {
  const { rooms, addRoom, updateRoom, removeRoom } = useBookingStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "training" as "training" | "office",
  })

  const trainingRooms = rooms.filter((room) => room.type === "training")
  const officeRooms = rooms.filter((room) => room.type === "office")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as "training" | "office",
    }))
  }

  const handleAddRoom = () => {
    if (formData.name.trim()) {
      const newRoom: Room = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type,
      }

      addRoom(newRoom)
      setFormData({ name: "", type: "training" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditRoom = () => {
    if (selectedRoomId && formData.name.trim()) {
      updateRoom(selectedRoomId, {
        name: formData.name.trim(),
        type: formData.type,
      })

      setFormData({ name: "", type: "training" })
      setSelectedRoomId(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteRoom = () => {
    if (selectedRoomId) {
      removeRoom(selectedRoomId)
      setSelectedRoomId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const openEditDialog = (room: Room) => {
    setSelectedRoomId(room.id)
    setFormData({
      name: room.name,
      type: room.type,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (roomId: string) => {
    setSelectedRoomId(roomId)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion des espaces</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un espace</DialogTitle>
              <DialogDescription>Créez une nouvelle salle de formation ou un nouveau bureau.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom de l'espace"
                />
              </div>

              <div className="space-y-2">
                <Label>Type d'espace</Label>
                <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="training" id="training" />
                    <Label htmlFor="training">Salle de formation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="office" />
                    <Label htmlFor="office">Bureau</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddRoom}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="training">Salles de formation</TabsTrigger>
            <TabsTrigger value="offices">Bureaux</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-2">
            {trainingRooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucune salle de formation</p>
            ) : (
              trainingRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-md">
                  <span>{room.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(room.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="offices" className="space-y-2">
            {officeRooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucun bureau</p>
            ) : (
              officeRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-md">
                  <span>{room.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(room.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'espace</DialogTitle>
              <DialogDescription>Modifiez les informations de cet espace.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom de l'espace"
                />
              </div>

              <div className="space-y-2">
                <Label>Type d'espace</Label>
                <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="training" id="edit-training" />
                    <Label htmlFor="edit-training">Salle de formation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="edit-office" />
                    <Label htmlFor="edit-office">Bureau</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleEditRoom}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l'espace</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cet espace ? Cette action supprimera également toutes les
                réservations associées.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteRoom}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

