"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockApplications, type Application } from "@/lib/mock-data"
import { Plus, Filter, Calendar, MapPin, DollarSign, FileText, Edit, Trash2 } from "lucide-react"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(mockApplications)
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(mockApplications)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)

  const [newApplication, setNewApplication] = useState<Partial<Application>>({
    company: "",
    role: "",
    status: "Applied",
    appliedDate: new Date().toISOString().split("T")[0],
    location: "",
    salary: "",
    notes: "",
  })

  // Filter applications
  const filterApplications = () => {
    let filtered = applications

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.role.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredApplications(filtered)
  }

  // Apply filters when dependencies change
  useState(() => {
    filterApplications()
  })

  const handleAddApplication = () => {
    if (newApplication.company && newApplication.role) {
      const application: Application = {
        id: Date.now().toString(),
        company: newApplication.company,
        role: newApplication.role,
        status: newApplication.status as Application["status"],
        appliedDate: newApplication.appliedDate || new Date().toISOString().split("T")[0],
        location: newApplication.location || "",
        salary: newApplication.salary,
        notes: newApplication.notes,
        deadline: newApplication.deadline,
      }

      setApplications([...applications, application])
      setNewApplication({
        company: "",
        role: "",
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
        location: "",
        salary: "",
        notes: "",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditApplication = (application: Application) => {
    setEditingApplication(application)
    setNewApplication(application)
    setIsAddDialogOpen(true)
  }

  const handleUpdateApplication = () => {
    if (editingApplication && newApplication.company && newApplication.role) {
      const updatedApplications = applications.map((app) =>
        app.id === editingApplication.id
          ? {
              ...app,
              company: newApplication.company!,
              role: newApplication.role!,
              status: newApplication.status as Application["status"],
              location: newApplication.location || "",
              salary: newApplication.salary,
              notes: newApplication.notes,
              deadline: newApplication.deadline,
            }
          : app,
      )

      setApplications(updatedApplications)
      setEditingApplication(null)
      setNewApplication({
        company: "",
        role: "",
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
        location: "",
        salary: "",
        notes: "",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteApplication = (id: string) => {
    setApplications(applications.filter((app) => app.id !== id))
  }

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Offer Received":
        return "default"
      case "Interview Scheduled":
        return "secondary"
      case "Rejected":
        return "destructive"
      case "Applied":
        return "outline"
      case "Saved":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <AppLayout>
        <PageHeader title="Applications Tracker" description="Manage and track all your job applications">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingApplication ? "Edit Application" : "Add New Application"}</DialogTitle>
                <DialogDescription>
                  {editingApplication ? "Update your application details" : "Add a new job application to track"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={newApplication.company || ""}
                    onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                    placeholder="e.g., Google"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={newApplication.role || ""}
                    onChange={(e) => setNewApplication({ ...newApplication, role: e.target.value })}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newApplication.status}
                    onValueChange={(value) =>
                      setNewApplication({ ...newApplication, status: value as Application["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="Offer Received">Offer Received</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Saved">Saved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appliedDate">Applied Date</Label>
                  <Input
                    id="appliedDate"
                    type="date"
                    value={newApplication.appliedDate || ""}
                    onChange={(e) => setNewApplication({ ...newApplication, appliedDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newApplication.location || ""}
                    onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    value={newApplication.salary || ""}
                    onChange={(e) => setNewApplication({ ...newApplication, salary: e.target.value })}
                    placeholder="e.g., $120,000 - $180,000"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newApplication.deadline || ""}
                    onChange={(e) => setNewApplication({ ...newApplication, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newApplication.notes || ""}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                  placeholder="Any additional notes about this application..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingApplication(null)
                    setNewApplication({
                      company: "",
                      role: "",
                      status: "Applied",
                      appliedDate: new Date().toISOString().split("T")[0],
                      location: "",
                      salary: "",
                      notes: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingApplication ? handleUpdateApplication : handleAddApplication}>
                  {editingApplication ? "Update Application" : "Add Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by company or role..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setTimeout(filterApplications, 100)
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setTimeout(filterApplications, 100)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="Offer Received">Offer Received</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Saved">Saved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{application.company}</h3>
                          <p className="text-muted-foreground">{application.role}</p>
                        </div>
                        <Badge variant={getStatusColor(application.status)}>{application.status}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                        {application.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.location}
                          </div>
                        )}
                        {application.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {application.salary}
                          </div>
                        )}
                        {application.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {new Date(application.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {application.notes && (
                        <div className="flex items-start gap-1 text-sm">
                          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <p className="text-muted-foreground">{application.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditApplication(application)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteApplication(application.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start tracking your job applications"}
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </AppLayout>
  )
}
