// File: MarkdownText.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface MarkdownTextProps {
  children: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ children }) => {
  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Handle headings (e.g., #, ##) or bold text
    const boldMatches = line.match(/\*\*(.*?)\*\*/g);
    if (boldMatches) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const textElements = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={partIndex} style={markdownStyles.bold}>
              {part.replace(/\*\*/g, '')}
            </Text>
          );
        }
        return <Text key={partIndex}>{part}</Text>;
      });
      elements.push(<Text key={`p-${index}`} style={markdownStyles.paragraph}>{textElements}</Text>);
      return;
    }
    
    // Handle lists
    if (line.trim().startsWith('*')) {
      elements.push(<Text key={`li-${index}`} style={markdownStyles.listItem}>{line.trim()}</Text>);
      return;
    }

    // Default to a paragraph
    elements.push(<Text key={`p-${index}`} style={markdownStyles.paragraph}>{line}</Text>);
  });

  return <>{elements}</>;
};

const markdownStyles = StyleSheet.create({
  paragraph: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginLeft: 15,
    marginBottom: 4,
  },
});