import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react'

import type { OurFileRouter } from '@/app/api/uploadthing/core'

// Pre-typed components bound to our file router, so endpoint names and their
// server-side return types are checked at the call site.
export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
