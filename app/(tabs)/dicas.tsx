import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

function DicaCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge} />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          {title}
        </ThemedText>
      </View>
      <ThemedText style={styles.cardText}>{children}</ThemedText>
    </View>
  );
}

export default function DicasScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Dicas de bem-estar
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Pequenas atitudes diárias que ajudam você a viver melhor.
        </ThemedText>

        <DicaCard title="Exercícios leves">
          Dê preferência a caminhadas curtas, alongamentos suaves e exercícios de
          baixo impacto. Sempre respeite seus limites e, em caso de dúvida,
          converse com seu profissional de saúde.
        </DicaCard>

        <DicaCard title="Hidratação">
          Beba água ao longo do dia, mesmo quando não estiver com sede. Mantenha
          sempre uma garrafinha por perto, especialmente antes e depois das
          atividades físicas.
        </DicaCard>

        <DicaCard title="Benefícios da caminhada">
          Caminhar regularmente ajuda a controlar a pressão arterial, melhora o
          humor, fortalece músculos e articulações e contribui para um sono de
          melhor qualidade.
        </DicaCard>

        <DicaCard title="Alongamentos">
          Reserve alguns minutos do dia para alongar pescoço, ombros, braços e
          pernas. Alongar-se reduz tensões, melhora a postura e aumenta a
          sensação de bem-estar.
        </DicaCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#F5FAFF',
  },
  title: {
    fontSize: 26,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E88E5',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 22,
  },
  cardText: {
    fontSize: 18,
    lineHeight: 24,
  },
});


