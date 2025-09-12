import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function HydrationIsKeyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#f43f5e" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hydration is Key</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Why Hydration Matters During Your Period</Text>
                    <Text style={styles.paragraph}>
                        Staying hydrated is crucial throughout your menstrual cycle, especially during your period. It can help reduce bloating, ease cramps, and combat the fatigue that many experience.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Quick Tips to Stay Hydrated 💧</Text>
                    <View style={styles.tipContainer}>
                        <Ionicons name="water-outline" size={24} color="#4b0082" style={styles.tipIcon} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipText}>
                                **Drink water consistently.** Aim for at least 8 glasses a day. Keep a water bottle with you to remind yourself.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tipContainer}>
                        <Ionicons name="beaker-outline" size={24} color="#4b0082" style={styles.tipIcon} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipText}>
                                **Include electrolytes.** Replenishing electrolytes can be very helpful. Try adding a pinch of sea salt to your water or drinking coconut water.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tipContainer}>
                        <Ionicons name="leaf-outline" size={24} color="#4b0082" style={styles.tipIcon} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipText}>
                                **Try herbal teas.** Peppermint or ginger tea can soothe cramps and aid digestion while keeping you hydrated.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tipContainer}>
                        <Ionicons name="ban-outline" size={24} color="#4b0082" style={styles.tipIcon} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipText}>
                                **Limit caffeine and sugary drinks.** These can have a dehydrating effect and may worsen bloating and cramps.
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
        backgroundColor: '#eef6ff',
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
        color: '#4b0082',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
        marginBottom: 10,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    tipIcon: {
        marginRight: 10,
        marginTop: 4,
    },
    tipContent: {
        flex: 1,
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});