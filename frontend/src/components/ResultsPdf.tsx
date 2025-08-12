import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a default font since we can't load external fonts in this environment
Font.register({ 
  family: 'Helvetica', 
  fonts: [
    { src: 'Helvetica' },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: { 
    fontSize: 24, 
    color: '#1f2937', 
    marginBottom: 6, 
    fontWeight: 'bold' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#6b7280' 
  },
  section: { 
    marginTop: 20 
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: { 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    borderRadius: 4, 
    fontSize: 9,
    backgroundColor: '#3b82f6', 
    color: '#ffffff', 
    fontWeight: 'bold',
  },
  card: {
    padding: 12, 
    borderRadius: 6, 
    backgroundColor: '#f9fafb', 
    borderColor: '#e5e7eb', 
    borderWidth: 1, 
    marginBottom: 12,
  },
  qTitle: { 
    fontSize: 11, 
    color: '#1f2937', 
    marginBottom: 6, 
    fontWeight: 'bold' 
  },
  label: { 
    fontSize: 9, 
    color: '#6b7280', 
    marginBottom: 2 
  },
  value: { 
    fontSize: 10, 
    color: '#374151' 
  },
  correct: { 
    color: '#059669' 
  },
  wrong: { 
    color: '#dc2626' 
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  }
});

interface ResultsPdfProps {
  quizData: any;
}

const ResultsPdf: React.FC<ResultsPdfProps> = ({ quizData }) => {
  const score = quizData.score || 0;
  const totalQuestions = quizData.questions?.length || quizData.count;
  const percentage = Math.round((score / totalQuestions) * 100);
  const optionLabels = ['A', 'B', 'C', 'D'];

  const topicStats = (() => {
    const stats: Record<string, { correct: number; total: number }> = {};
    const questions: any[] = Array.isArray(quizData.questions) ? quizData.questions : [];
    const answers: Record<string, number> = quizData.answers || {};
    
    for (const q of questions) {
      const topic = q.topic || 'General';
      if (!stats[topic]) stats[topic] = { correct: 0, total: 0 };
      stats[topic].total += 1;
      if (answers[q.id] === q.correctAnswer) stats[topic].correct += 1;
    }
    
    return Object.entries(stats).map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    }));
  })();

  const generateExplanation = (q: any) => {
    return `The correct option best reflects the core concept for ${q.topic}. Review how the incorrect options differ in scope or logic.`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Report</Text>
          <Text style={styles.subtitle}>Score: {score}/{totalQuestions} • {percentage}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance by Topic</Text>
          {topicStats.length === 0 ? (
            <Text style={styles.subtitle}>No topic data available.</Text>
          ) : (
            topicStats.map(t => (
              <View key={t.topic} style={styles.row}>
                <Text style={styles.value}>{t.topic}</Text>
                <Text style={styles.value}>{t.correct}/{t.total} • {t.percent}%</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Report</Text>
          {quizData.questions?.map((q: any, idx: number) => {
            const userIdx = quizData.answers?.[q.id];
            const correctIdx = q.correctAnswer;
            const isCorrect = userIdx === correctIdx;
            
            return (
              <View key={q.id} style={styles.card} wrap>
                <View style={styles.row}>
                  <Text style={styles.subtitle}>Question {idx + 1}</Text>
                  <Text style={styles.badge}>{isCorrect ? 'Correct' : 'Incorrect'}</Text>
                </View>
                
                <Text style={styles.qTitle}>{q.question}</Text>
                
                <View style={styles.row}>
                  <View style={{ width: '48%' }}>
                    <Text style={styles.label}>Your Answer</Text>
                    <Text style={[styles.value, isCorrect ? styles.correct : styles.wrong]}>
                      {userIdx === undefined ? 'Not answered' : `${optionLabels[userIdx]}. ${q.options?.[userIdx]}`}
                    </Text>
                  </View>
                  <View style={{ width: '48%' }}>
                    <Text style={styles.label}>Correct Answer</Text>
                    <Text style={[styles.value, styles.correct]}>
                      {`${optionLabels[correctIdx]}. ${q.options?.[correctIdx]}`}
                    </Text>
                  </View>
                </View>
                
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Explanation</Text>
                  <Text style={styles.value}>{generateExplanation(q)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.subtitle}>Generated by Neocortex Quiz Platform</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ResultsPdf;


