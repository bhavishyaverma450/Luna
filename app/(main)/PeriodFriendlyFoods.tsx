import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function PeriodFriendlyFoodsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#f43f5e" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Period-friendly foods</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Nutrition for a Better Period</Text>
                    <Text style={styles.paragraph}>
                        Eating the right foods during your period can make a significant difference in how you feel. A balanced diet can help manage cramps, bloating, and mood swings.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Foods to Eat to Feel Your Best 🌱</Text>
                    <View style={styles.foodItemContainer}>
                        <Ionicons name="nutrition-outline" size={24} color="#4caf50" style={styles.foodIcon} />
                        <View style={styles.foodContent}>
                            <Text style={styles.foodText}>
                                **Leafy Greens:** Spinach and kale are rich in iron, which helps combat fatigue caused by blood loss.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.foodItemContainer}>
                        <Ionicons name="fish-outline" size={24} color="#4caf50" style={styles.foodIcon} />
                        <View style={styles.foodContent}>
                            <Text style={styles.foodText}>
                                **Fatty Fish:** Salmon and tuna are high in Omega-3 fatty acids, which can reduce inflammation and muscle pain.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.foodItemContainer}>
                        <Ionicons name="cube-outline" size={24} color="#4caf50" style={styles.foodIcon} />
                        <View style={styles.foodContent}>
                            <Text style={styles.foodText}>
                                **Whole Grains:** Oats and brown rice provide B vitamins and magnesium, which are great for energy and muscle relaxation.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.foodItemContainer}>
                        <Ionicons name="fast-food-outline" size={24} color="#4caf50" style={styles.foodIcon} />
                        <View style={styles.foodContent}>
                            <Text style={styles.foodText}>
                                **Fruits:** Watermelon and cucumber are high in water, helping with hydration and bloating.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fdf2f8',
    },
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#fde3f0',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f43f5e',
    },
    card: {
        backgroundColor: '#e8fdf2',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4caf50',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
        marginBottom: 10,
    },
    foodItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    foodIcon: {
        marginRight: 10,
        marginTop: 4,
    },
    foodContent: {
        flex: 1,
    },
    foodText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});