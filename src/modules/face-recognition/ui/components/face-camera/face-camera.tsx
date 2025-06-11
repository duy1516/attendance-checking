'use client'

import { Button } from '@/components/ui/button'
import { VideoIcon, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


// Define user type
type User = {
  id: string
  name: string
  email: string
  role: string
}

// Fetch auth status
const fetchAuthStatus = async (): Promise<{ user: User | null }> => {
  const res = await fetch('/api/auth/status')
  if (!res.ok) throw new Error('Failed to fetch auth status')
  const data = await res.json()
  return data.isAuthenticated ? { user: data.user } : { user: null }
}

export default function FaceScanner({ classId }: { classId: string }) {

  const [showModal, setShowModal] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streaming, setStreaming] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['authStatus'],
    queryFn: fetchAuthStatus,
    staleTime: 1000 * 60,
  })

  const user = data?.user

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreaming(true)
      }
    } catch (err) {
      console.error('Error accessing the camera:', err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setStreaming(false)
    }
  }

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/face-recognition/face-scan', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      // Don't throw error for session_closed status - we want to handle it gracefully
      if (!res.ok && data.status !== 'session_closed') {
        throw new Error(data.error || 'Recognition failed')
      }

      return { ...data, httpStatus: res.status }
    },
    onSuccess: (data) => {
      console.log('Recognition result:', data)

      if (data.status === 'success') {
        alert('Face recognized successfully, welcome back!')
        setShowModal(false)
        stopCamera()
      } else if (data.status === 'session_closed') {
        alert('Session was closed during recognition. You have been marked as absent.')
        setShowModal(false)
        stopCamera()
      } else if (data.status === 'already_recorded') {
        alert('Your attendance has already been recorded for this session.')
        setShowModal(false)
        stopCamera()
      } else {
        alert('Face not recognized.')
      }
    },
    onError: (err) => {
      console.error('Recognition error:', err)
      alert('Cannot recognize face. Please try again.')
    },
  })

  const captureImage = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const formData = new FormData()
            formData.append('image', blob, 'capture.jpg')
            formData.append('classId', classId)
            mutation.mutate(formData)
          } else {
            alert('Failed to capture image blob')
          }
        },
        'image/jpeg'
      )
    } else {
      alert('Failed to get canvas context')
    }
  }

  const fetchSessionStatus = async (): Promise<{ sessionOpen: boolean }> => {
    const res = await fetch(`/api/session/status/${classId}`)
    if (!res.ok) throw new Error("Failed to fetch session status")
    return res.json()
  }

  const {
    data: sessionStatus,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ['sessionStatus', classId],
    queryFn: fetchSessionStatus,
    enabled: !!classId,
  })

  const disabled = sessionLoading || sessionError || !sessionStatus?.sessionOpen


  if (isLoading || isError || !user || user.role !== 'student') return null

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <VideoIcon
                onClick={() => {
                  if (disabled || !sessionStatus?.sessionOpen) return
                  setShowModal(true)
                  startCamera()
                }}
                className={`cursor-pointer mb-2 ${disabled || !sessionStatus?.sessionOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              />


            </div>
          </TooltipTrigger>
          <TooltipContent>
            {sessionStatus?.sessionOpen ? 'Start face scan' : 'No active session found'}
          </TooltipContent>


        </Tooltip>
      </TooltipProvider>


      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-white p-4 rounded-lg w-full h-full max-w-[800px] max-h-[600px] relative">
            <X
              onClick={() => {
                setShowModal(false)
                stopCamera()
              }}
              className="absolute right-0 cursor-pointer mx-4"
            />

            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-lg w-full max-w-2xl"
              />
              {streaming && (
                <Button
                  onClick={captureImage}
                  disabled={mutation.isPending}
                  className="mt-4 text-white px-4 py-2 rounded-lg"
                >
                  {mutation.isPending ? 'Processing...' : 'Capture Image'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}