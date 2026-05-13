import type { ExperimentDetail } from '@/types/domain'

export const experimentDetails: Record<number, ExperimentDetail> = {
  1: {
    id: 1,
    externalId: 'exp-cv-baseline-2401',
    description: 'Baseline for package defect image classification on warehouse camera snapshots.',
    tags: ['computer-vision', 'classification', 'resnet'],
    runs: [
      { id: 101, name: 'resnet50-baseline', startTime: '28.04.2026, 10:12', dataset: 'packshots_v14 (58k)', duration: '18м 42с', model: 'defect-resnet50', metrics: 'Accuracy 0.914 · F1 0.881', status: 'completed' },
      { id: 102, name: 'resnet50-augmix', startTime: '28.04.2026, 13:28', dataset: 'packshots_v15 (61k)', duration: 'выполняется', model: 'defect-resnet50', metrics: 'interim F1 0.892', status: 'running' },
    ],
    models: [
      { id: 201, name: 'defect-resnet50', updatedAt: '28.04.2026, 11:27', version: 'defect-resnet50-v14.2', quality: 'F1 0.881 · Precision 0.934' },
      { id: 202, name: 'defect-resnet34', updatedAt: '27.04.2026, 16:03', version: 'defect-resnet34-v8.7', quality: 'F1 0.857 · Precision 0.911' },
    ],
  },
  2: {
    id: 2,
    externalId: 'exp-nlp-intent-1182',
    description: 'Intent classifier for support tickets and chat messages with class imbalance handling.',
    tags: ['nlp', 'bert', 'intent'],
    runs: [
      { id: 201, name: 'rubert-balanced-loss', startTime: '28.04.2026, 09:40', dataset: 'support_intents_v9 (420k)', duration: '36м 10с', model: 'intent-rubert', metrics: 'Macro F1 0.842 · Recall 0.821', status: 'completed' },
      { id: 202, name: 'deberta-v3-small', startTime: '28.04.2026, 12:17', dataset: 'support_intents_v10 (455k)', duration: '44м 33с', model: 'intent-deberta', metrics: 'Macro F1 0.857 · Recall 0.836', status: 'completed' },
    ],
    models: [
      { id: 301, name: 'intent-rubert', updatedAt: '28.04.2026, 10:28', version: 'intent-rubert-v2.9', quality: 'Macro F1 0.842 · AUC 0.931' },
      { id: 302, name: 'intent-deberta', updatedAt: '28.04.2026, 13:07', version: 'intent-deberta-v1.3', quality: 'Macro F1 0.857 · AUC 0.944' },
    ],
  },
  3: {
    id: 3,
    externalId: 'exp-yolo-detection-3317',
    description: 'PPE detection (helmets/vests) in shopfloor CCTV streams.',
    tags: ['computer-vision', 'detection', 'yolo'],
    runs: [
      { id: 301, name: 'yolov8m-640', startTime: '27.04.2026, 11:22', dataset: 'ppe_frames_v6 (1.2M)', duration: '52м 06с', model: 'ppe-yolov8m', metrics: 'mAP50 0.962 · mAP50-95 0.711', status: 'completed' },
      { id: 302, name: 'yolov8l-960', startTime: '27.04.2026, 12:53', dataset: 'ppe_frames_v6 (1.2M)', duration: '1ч 18м', model: 'ppe-yolov8l', metrics: 'mAP50 0.969 · mAP50-95 0.736', status: 'completed' },
    ],
    models: [
      { id: 401, name: 'ppe-yolov8m', updatedAt: '27.04.2026, 12:20', version: 'ppe-yolov8m-v6.4', quality: 'mAP50-95 0.711 · FPS 67' },
      { id: 402, name: 'ppe-yolov8l', updatedAt: '27.04.2026, 14:19', version: 'ppe-yolov8l-v2.1', quality: 'mAP50-95 0.736 · FPS 45' },
    ],
  },
  4: {
    id: 4,
    externalId: 'exp-seg-proto-0404',
    description: 'Prototype of pallet zone segmentation for loading dock cameras.',
    tags: ['computer-vision', 'segmentation'],
    runs: [
      { id: 401, name: 'sam-vit-h-adapter', startTime: '26.04.2026, 16:01', dataset: 'dock_masks_v3 (92k)', duration: '47м 29с', model: 'sam-zone-seg', metrics: 'mIoU 0.781 · Dice 0.824', status: 'completed' },
      { id: 402, name: 'sam-vit-l-fast', startTime: '26.04.2026, 19:20', dataset: 'dock_masks_v4 (101k)', duration: 'выполняется', model: 'sam-zone-seg', metrics: 'interim mIoU 0.768', status: 'running' },
    ],
    models: [
      { id: 501, name: 'sam-zone-seg', updatedAt: '26.04.2026, 17:02', version: 'sam-zone-seg-v0.8', quality: 'mIoU 0.781 · Dice 0.824' },
      { id: 502, name: 'unet-zone-seg', updatedAt: '25.04.2026, 20:11', version: 'unet-zone-seg-v3.4', quality: 'mIoU 0.744 · Dice 0.801' },
    ],
  },
  5: {
    id: 5,
    externalId: 'exp-prompt-benchmark-0526',
    description: 'Prompt quality benchmark for FAQ answer relevance and safety.',
    tags: ['nlp', 'evaluation', 'llm'],
    runs: [{ id: 501, name: 'faq-promptset-a', startTime: '26.04.2026, 13:50', dataset: 'faq_eval_v7 (14k)', duration: '15м 19с', model: 'faq-llm-judge', metrics: 'Relevance 4.42/5 · Hallucination 2.1%', status: 'completed' }],
    models: [{ id: 601, name: 'faq-llm-judge', updatedAt: '26.04.2026, 14:18', version: 'faq-judge-v2.2', quality: 'Relevance 4.42/5 · Safety 98.3%' }],
  },
  6: {
    id: 6,
    externalId: 'exp-risk-tabnet-0652',
    description: 'Fraud transaction risk scoring with TabNet and temporal features.',
    tags: ['classification', 'tabnet'],
    runs: [{ id: 601, name: 'tabnet-time-split', startTime: '25.04.2026, 10:08', dataset: 'fraud_tx_v12 (8.4M)', duration: '39м 54с', model: 'fraud-tabnet', metrics: 'AUC 0.972 · Recall@1% 0.611', status: 'completed' }],
    models: [{ id: 701, name: 'fraud-tabnet', updatedAt: '25.04.2026, 11:01', version: 'fraud-tabnet-v5.0', quality: 'AUC 0.972 · KS 0.71' }],
  },
  7: {
    id: 7,
    externalId: 'exp-ocr-invoices-0703',
    description: 'OCR pipeline tuning for invoice digitization with key-value extraction.',
    tags: ['computer-vision', 'ocr'],
    runs: [{ id: 701, name: 'trocr-ru-invoice', startTime: '25.04.2026, 09:33', dataset: 'invoices_scan_v5 (230k)', duration: '28м 44с', model: 'invoice-ocr-trocr', metrics: 'CER 0.038 · F1(KV) 0.903', status: 'completed' }],
    models: [{ id: 801, name: 'invoice-ocr-trocr', updatedAt: '25.04.2026, 10:15', version: 'invoice-ocr-v3.6', quality: 'CER 0.038 · WER 0.071' }],
  },
  8: {
    id: 8,
    externalId: 'exp-rag-retrieval-0811',
    description: 'Retriever tuning for support knowledge base with hybrid search.',
    tags: ['nlp', 'retrieval'],
    runs: [{ id: 801, name: 'bge-m3-hybrid-rerank', startTime: '24.04.2026, 17:09', dataset: 'kb_queries_v11 (180k)', duration: '33м 41с', model: 'support-retriever', metrics: 'Recall@10 0.918 · nDCG@10 0.842', status: 'completed' }],
    models: [{ id: 901, name: 'support-retriever', updatedAt: '24.04.2026, 18:02', version: 'support-retriever-v4.1', quality: 'Recall@10 0.918 · MRR 0.807' }],
  },
  9: {
    id: 9,
    externalId: 'exp-feature-drift-0902',
    description: 'Feature drift monitoring study between March and April transaction cohorts.',
    tags: ['monitoring', 'tabular'],
    runs: [{ id: 901, name: 'psi-monthly-scan', startTime: '24.04.2026, 15:20', dataset: 'fraud_features_apr (12M)', duration: '12м 06с', model: 'drift-monitor', metrics: 'PSI>0.2: 7 features · JSD mean 0.081', status: 'completed' }],
    models: [{ id: 1001, name: 'drift-monitor', updatedAt: '24.04.2026, 16:01', version: 'drift-monitor-v1.8', quality: 'Alert precision 0.88 · Recall 0.79' }],
  },
  10: {
    id: 10,
    externalId: 'exp-text-sum-lite-1020',
    description: 'Lightweight summarization model for short support conversations.',
    tags: ['nlp', 'summarization'],
    runs: [{ id: 1001, name: 'mt5-small-lora', startTime: '23.04.2026, 10:17', dataset: 'chat_summ_v6 (320k)', duration: '41м 02с', model: 'support-sum-lite', metrics: 'ROUGE-L 0.412 · BERTScore 0.893', status: 'completed' }],
    models: [{ id: 1101, name: 'support-sum-lite', updatedAt: '23.04.2026, 11:21', version: 'support-sum-lite-v2.0', quality: 'ROUGE-L 0.412 · Latency 84ms' }],
  },
  11: {
    id: 11,
    externalId: 'exp-cls-distill-1104',
    description: 'Distillation of defect classifier for edge GPU deployment.',
    tags: ['classification', 'distillation'],
    runs: [{ id: 1101, name: 'teacher-student-kd', startTime: '22.04.2026, 14:46', dataset: 'packshots_v13 (54k)', duration: '26м 27с', model: 'defect-distilled', metrics: 'F1 0.872 · Size -62%', status: 'completed' }],
    models: [{ id: 1201, name: 'defect-distilled', updatedAt: '22.04.2026, 15:31', version: 'defect-distilled-v1.6', quality: 'F1 0.872 · 6.1M params' }],
  },
  12: {
    id: 12,
    externalId: 'exp-track-metrics-1212',
    description: 'Object tracking benchmark with ID consistency metrics on conveyor footage.',
    tags: ['computer-vision', 'tracking'],
    runs: [{ id: 1201, name: 'bytetrack-x', startTime: '22.04.2026, 12:04', dataset: 'conveyor_tracks_v4 (89k)', duration: '35м 15с', model: 'conveyor-tracker', metrics: 'MOTA 0.781 · IDF1 0.744', status: 'completed' }],
    models: [{ id: 1301, name: 'conveyor-tracker', updatedAt: '22.04.2026, 13:02', version: 'conveyor-tracker-v2.3', quality: 'MOTA 0.781 · IDsw 112' }],
  },
}
