import type { StorageHeader, StorageRow, StorageTab } from './types'

export const projects = ['Общее', 'Название проекта', 'DataLab']
export const fileTypes = ['Датасет', 'Разметка', 'Артефакты модели']

export const bucketRows: StorageRow[] = [
  {
    id: 1,
    name: 'Название бакета 1',
    size: '22.8 МБ',
    createdAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 2,
    name: 'Название бакета 2',
    size: '128.5 МБ',
    createdAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 3,
    name: 'Название бакета 3',
    size: '1.2 МБ',
    createdAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 4,
    name: 'Название бакета 4',
    size: '128.5 МБ',
    createdAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 5,
    name: 'Название бакета 5',
    size: '22.8 МБ',
    createdAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
]

export const fileRows: StorageRow[] = [
  {
    id: 1,
    name: 'Название файла 1',
    type: 'Датасет',
    size: '22.8 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 2,
    name: 'Название файла 2',
    type: 'Разметка',
    size: '22.8 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 3,
    name: 'Название файла 3',
    type: 'Артефакты модели',
    size: '1.2 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 4,
    name: 'Название файла 4',
    type: 'Датасет',
    size: '128.5 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 5,
    name: 'Название файла 5',
    type: 'Артефакты модели',
    size: '22.8 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 6,
    name: 'Название файла 6',
    type: 'Разметка',
    size: '22.8 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 7,
    name: 'Название файла 7',
    type: 'Датасет',
    size: '6.3 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 8,
    name: 'Название файла 8',
    type: 'Артефакты модели',
    size: '1.2 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 9,
    name: 'Название файла 9',
    type: 'Артефакты модели',
    size: '128.5 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
  {
    id: 10,
    name: 'Название файла 10',
    type: 'Датасет',
    size: '22.8 МБ',
    uploadedAt: '08.01.2026, 15:00',
    project: 'Название проекта',
  },
]

export const tableRows: StorageRow[] = [
  {
    id: 1,
    name: 'table_name_1',
    type: 'Исходные данные',
    rows: 123,
    createdAt: '08.01.2026, 15:00',
  },
  { id: 2, name: 'table_name_2', type: 'Признаки', rows: 452, createdAt: '08.01.2026, 15:00' },
  {
    id: 3,
    name: 'table_name_3',
    type: 'Исходные данные',
    rows: 15105,
    createdAt: '08.01.2026, 15:00',
  },
  { id: 4, name: 'table_name_4', type: 'Признаки', rows: 123, createdAt: '08.01.2026, 15:00' },
  { id: 5, name: 'table_name_5', type: 'Признаки', rows: 452, createdAt: '08.01.2026, 15:00' },
  {
    id: 6,
    name: 'table_name_6',
    type: 'Исходные данные',
    rows: 15105,
    createdAt: '08.01.2026, 15:00',
  },
  {
    id: 7,
    name: 'table_name_7',
    type: 'Исходные данные',
    rows: 123,
    createdAt: '08.01.2026, 15:00',
  },
  { id: 8, name: 'table_name_8', type: 'Признаки', rows: 452, createdAt: '08.01.2026, 15:00' },
  { id: 9, name: 'table_name_9', type: 'Признаки', rows: 15105, createdAt: '08.01.2026, 15:00' },
  { id: 10, name: 'table_name_10', type: 'Признаки', rows: 123, createdAt: '08.01.2026, 15:00' },
  {
    id: 11,
    name: 'table_name_11',
    type: 'Исходные данные',
    rows: 452,
    createdAt: '08.01.2026, 15:00',
  },
  { id: 12, name: 'table_name_12', type: 'Признаки', rows: 15105, createdAt: '08.01.2026, 15:00' },
]

export const headersByTab: Record<StorageTab, StorageHeader[]> = {
  buckets: [
    { title: 'Название', key: 'name' },
    { title: 'Размер', key: 'size' },
    { title: 'Дата создания', key: 'createdAt' },
    { title: 'Проект', key: 'project' },
    { title: '', key: 'actions', sortable: false },
  ],
  files: [
    { title: 'Имя файла', key: 'name' },
    { title: 'Тип', key: 'type' },
    { title: 'Размер', key: 'size' },
    { title: 'Дата загрузки', key: 'uploadedAt' },
    { title: 'Проект', key: 'project' },
    { title: '', key: 'actions', sortable: false },
  ],
  tables: [
    { title: 'Название', key: 'name' },
    { title: 'Тип', key: 'type' },
    { title: 'Размер, строки', key: 'rows' },
    { title: 'Дата создания', key: 'createdAt' },
    { title: '', key: 'actions', sortable: false },
  ],
}
