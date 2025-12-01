import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Activity, User } from './db';

type ExportPdfParams = {
  user: User | null;
  activities: Activity[];
  periodStart: string;
  periodEnd: string;
};

export async function exportActivitiesToPdf({
  user,
  activities,
  periodStart,
  periodEnd,
}: ExportPdfParams) {
  const html = buildHtml({ user, activities, periodStart, periodEnd });

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar relatório em PDF',
      UTI: 'com.adobe.pdf',
    });
  }

  return uri;
}

function buildHtml({
  user,
  activities,
  periodStart,
  periodEnd,
}: ExportPdfParams) {
  const rows = activities
    .map(
      (a) => `
      <tr>
        <td>${a.activity_date}</td>
        <td>${a.type}</td>
        <td>${a.duration_minutes} min</td>
        <td>${a.intensity}</td>
      </tr>
    `,
    )
    .join('');

  const userInfo = user
    ? `
      <p><strong>Nome:</strong> ${user.name}</p>
      <p><strong>Idade:</strong> ${user.age} anos</p>
      <p><strong>Peso:</strong> ${user.weight} kg</p>
      <p><strong>Altura:</strong> ${user.height} cm</p>
      ${
        user.health_notes
          ? `<p><strong>Observações de saúde:</strong> ${user.health_notes}</p>`
          : ''
      }
    `
    : '<p>Nenhum usuário cadastrado.</p>';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h1 { text-align: center; color: #1E88E5; }
          h2 { margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
          th { background-color: #f0f0f0; }
          footer { margin-top: 32px; font-size: 10px; text-align: center; color: #777; }
        </style>
      </head>
      <body>
        <h1>Bem Viver - Relatório de Atividades Físicas</h1>

        <h2>Dados do usuário</h2>
        ${userInfo}

        <h2>Período analisado</h2>
        <p>${periodStart} até ${periodEnd}</p>

        <h2>Atividades registradas</h2>
        ${
          activities.length
            ? `
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Atividade</th>
                    <th>Duração</th>
                    <th>Intensidade</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            `
            : '<p>Nenhuma atividade registrada no período.</p>'
        }

        <footer>
          Aplicativo alinhado à ODS 3 - Saúde e Bem-Estar. Incentivando a prática segura de atividades físicas para pessoas idosas.
        </footer>
      </body>
    </html>
  `;
}


