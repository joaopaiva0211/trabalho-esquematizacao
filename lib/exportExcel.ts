import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import type { Activity } from './db';

export async function exportActivitiesToExcel(activities: Activity[]) {
  if (!activities.length) {
    throw new Error('Nenhuma atividade para exportar.');
  }

  const data = activities.map((a) => ({
    ID: a.id,
    'Data atividade': a.activity_date,
    'Tipo de atividade': a.type,
    'Duração (minutos)': a.duration_minutes,
    Intensidade: a.intensity,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Atividades');

  const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

  // expo-file-system types don't expose cacheDirectory or EncodingType, so use string '/cache/' and 'base64' directly
  // Fallback to cacheDirectory if documentDirectory is unavailable
  const directory = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '/cache/';
  const fileUri = directory + `atividades_bem_viver_${Date.now()}.xlsx`;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    // usar literal 'base64' diretamente para evitar depender de FileSystem.EncodingType
    encoding: 'base64',
  });


  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Exportar atividades para Excel',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }

  return fileUri;
}


