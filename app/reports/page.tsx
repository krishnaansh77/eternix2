"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  FileText,
  Download,
  Eye,
  MoreVertical,
  Heart,
  Scan,
  Brain,
  Upload,
  Filter,
} from "lucide-react"
import { mockPatients } from "@/lib/mock-data"

type ReportType = "ecg" | "xray" | "mri" | "blood" | "other"

interface Report {
  id: string
  patientId: string
  patientName: string
  type: ReportType
  fileName: string
  uploadedAt: string
  fileSize: string
  status: "processed" | "pending" | "failed"
}

const mockReports: Report[] = [
  {
    id: "r1",
    patientId: "1",
    patientName: "John Smith",
    type: "ecg",
    fileName: "ecg_scan_2024.pdf",
    uploadedAt: "2024-01-15",
    fileSize: "2.4 MB",
    status: "processed",
  },
  {
    id: "r2",
    patientId: "2",
    patientName: "Sarah Johnson",
    type: "xray",
    fileName: "chest_xray.png",
    uploadedAt: "2024-01-14",
    fileSize: "5.1 MB",
    status: "processed",
  },
  {
    id: "r3",
    patientId: "3",
    patientName: "Michael Chen",
    type: "mri",
    fileName: "brain_mri_series.dicom",
    uploadedAt: "2024-01-13",
    fileSize: "156 MB",
    status: "processed",
  },
  {
    id: "r4",
    patientId: "4",
    patientName: "Emily Davis",
    type: "blood",
    fileName: "blood_panel_results.pdf",
    uploadedAt: "2024-01-12",
    fileSize: "1.2 MB",
    status: "processed",
  },
  {
    id: "r5",
    patientId: "1",
    patientName: "John Smith",
    type: "xray",
    fileName: "spine_xray.png",
    uploadedAt: "2024-01-11",
    fileSize: "4.8 MB",
    status: "pending",
  },
  {
    id: "r6",
    patientId: "5",
    patientName: "Robert Wilson",
    type: "ecg",
    fileName: "holter_monitor.pdf",
    uploadedAt: "2024-01-10",
    fileSize: "3.2 MB",
    status: "processed",
  },
  {
    id: "r7",
    patientId: "6",
    patientName: "Lisa Anderson",
    type: "mri",
    fileName: "knee_mri.dicom",
    uploadedAt: "2024-01-09",
    fileSize: "98 MB",
    status: "failed",
  },
  {
    id: "r8",
    patientId: "2",
    patientName: "Sarah Johnson",
    type: "blood",
    fileName: "lipid_panel.pdf",
    uploadedAt: "2024-01-08",
    fileSize: "0.8 MB",
    status: "processed",
  },
]

const reportTypeConfig: Record<ReportType, { icon: React.ElementType; label: string; color: string }> = {
  ecg: { icon: Heart, label: "ECG", color: "bg-red-100 text-red-700" },
  xray: { icon: Scan, label: "X-Ray", color: "bg-blue-100 text-blue-700" },
  mri: { icon: Brain, label: "MRI", color: "bg-purple-100 text-purple-700" },
  blood: { icon: FileText, label: "Blood Work", color: "bg-green-100 text-green-700" },
  other: { icon: FileText, label: "Other", color: "bg-gray-100 text-gray-700" },
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [previewReport, setPreviewReport] = useState<Report | null>(null)

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || report.type === typeFilter
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: mockReports.length,
    ecg: mockReports.filter((r) => r.type === "ecg").length,
    xray: mockReports.filter((r) => r.type === "xray").length,
    mri: mockReports.filter((r) => r.type === "mri").length,
    pending: mockReports.filter((r) => r.status === "pending").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Manage and view all uploaded medical reports
            </p>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ECG Reports</p>
                  <p className="text-2xl font-bold">{stats.ecg}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">X-Ray Reports</p>
                  <p className="text-2xl font-bold">{stats.xray}</p>
                </div>
                <Scan className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRI Reports</p>
                  <p className="text-2xl font-bold">{stats.mri}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reports by patient or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ecg">ECG</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                    <SelectItem value="blood">Blood Work</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const typeConfig = reportTypeConfig[report.type]
                  const TypeIcon = typeConfig.icon
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${typeConfig.color}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                          {typeConfig.label}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{report.fileName}</TableCell>
                      <TableCell>{report.patientName}</TableCell>
                      <TableCell>{new Date(report.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{report.fileSize}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === "processed"
                              ? "default"
                              : report.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewReport(report)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
            </DialogHeader>
            {previewReport && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {(() => {
                      const TypeIcon = reportTypeConfig[previewReport.type].icon
                      return <TypeIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    })()}
                    <p className="text-muted-foreground">Preview not available</p>
                    <p className="text-sm text-muted-foreground">{previewReport.fileName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Patient:</span>
                    <p className="font-medium">{previewReport.patientName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{reportTypeConfig[previewReport.type].label}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded:</span>
                    <p className="font-medium">{new Date(previewReport.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Size:</span>
                    <p className="font-medium">{previewReport.fileSize}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
