export type StorageTab = 'buckets' | 'files' | 'tables'

export type StorageMode = 'overview' | 'details'

export type StorageRow = Record<string, string | number>

export type StorageHeader = { title: string; key: string; sortable?: boolean }

export type BucketForm = {
  name: string
  project: string
  versioning: boolean
  hasLimit: boolean
}

export type UploadForm = {
  name: string
  type: string
  bucket: string
  file: File | null
}
