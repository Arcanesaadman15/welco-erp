'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Keyboard } from 'lucide-react'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (open && scanning) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [open, scanning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      setManualCode('')
    }
  }

  const handleClose = () => {
    stopCamera()
    setScanning(false)
    setManualCode('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="manual" className="data-[state=active]:bg-emerald-600">
              <Keyboard className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger 
              value="camera" 
              onClick={() => setScanning(true)}
              className="data-[state=active]:bg-emerald-600"
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode or item code"
                className="bg-slate-700/50 border-slate-600 text-white"
                autoFocus
              />
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Submit
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-emerald-400 rounded-lg" />
              </div>
            </div>
            <p className="text-sm text-slate-400 text-center">
              Position the barcode within the green frame
            </p>
            <p className="text-xs text-slate-500 text-center">
              Note: Camera scanning requires the html5-qrcode library integration.
              For now, use manual entry or connect a USB barcode scanner.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

