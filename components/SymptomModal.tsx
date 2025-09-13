import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    ScrollView,
    Dimensions,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from "react-native";

interface SymptomModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (date: string, symptoms: string[], notes: string) => void;
    selectedDate: string | null;
    initialSymptoms?: string[];
    initialNotes?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const symptomCategories = {
    "Mood & Energy": [
        "Mood swings", "Irritability", "Anxiety", "Sadness", "Energetic", "Fatigue", "Cravings", "Low libido", "High libido", "Stress"
    ],
    "Physical Symptoms": [
        "Cramps", "Bloating", "Tender breasts", "Acne", "Backache", "Swelling", "Headache", "Dizziness", "Nausea", "Joint pain", "Migraines"
    ],
    "Discharge": [
        "Thick", "Thin", "Watery", "Sticky", "Brown", "Spotting", "Creamy", "Clear", "Clots", "Heavy flow", "Light flow"
    ],
    "Health & Body": [
        "Insomnia", "Vivid dreams", "Hot flashes", "Chills", "Weight gain", "Weight loss", "Appetite increase", "Appetite decrease"
    ]
};

const SymptomModal = ({
    isVisible,
    onClose,
    onSave,
    selectedDate,
    initialSymptoms = [],
    initialNotes = ""
}: SymptomModalProps) => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms);
    const [notes, setNotes] = useState<string>(initialNotes);
    const scrollViewRef = useRef<ScrollView>(null);
    const notesInputRef = useRef<TextInput>(null);

    useEffect(() => {
        setSelectedSymptoms(initialSymptoms);
        setNotes(initialNotes);
    }, [initialSymptoms, initialNotes]);

    const toggleSymptom = (symptom: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleSave = () => {
        if (selectedDate) {
            onSave(selectedDate, selectedSymptoms, notes);
        }
        onClose();
    };

    const scrollToNotes = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200); // small delay to allow keyboard animation
    };

    const renderSymptomButtons = (symptoms: string[]) => (
        <View style={styles.symptomButtonContainer}>
            {symptoms.map((symptom) => (
                <TouchableOpacity
                    key={symptom}
                    style={[
                        styles.symptomButton,
                        selectedSymptoms.includes(symptom) && styles.symptomButtonActive,
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                >
                    <Text style={[
                        styles.symptomButtonText,
                        selectedSymptoms.includes(symptom) && styles.symptomButtonTextActive,
                    ]}>{symptom}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <SafeAreaView style={styles.modalContainer}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={styles.symptomsModalHeader}>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#555" />
                            </TouchableOpacity>
                            <Text style={styles.symptomsModalTitle}>
                                {selectedDate ? new Date(selectedDate).toLocaleString("en-us", { month: "long", day: "numeric", year: "numeric" }) : "Log Symptoms"}
                            </Text>
                        </View>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.symptomsModalContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {Object.entries(symptomCategories).map(([category, symptoms]) => (
                                <View key={category} style={styles.symptomCategory}>
                                    <Text style={styles.symptomSectionTitle}>{category}</Text>
                                    {renderSymptomButtons(symptoms)}
                                </View>
                            ))}

                            <View style={styles.notesSection}>
                                <Text style={styles.symptomSectionTitle}>Notes</Text>
                                <TextInput
                                    ref={notesInputRef}
                                    style={styles.notesInput}
                                    placeholder="Add personal notes for the day..."
                                    placeholderTextColor="#a0a0a0"
                                    multiline
                                    value={notes}
                                    onChangeText={setNotes}
                                    onFocus={scrollToNotes} // 👈 scroll into view when focused
                                />
                            </View>

                            <TouchableOpacity style={styles.saveSymptomsButton} onPress={handleSave}>
                                <Text style={styles.saveSymptomsButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        width: "100%",
        height: screenHeight * 0.85,
        backgroundColor: "white",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 20,
        paddingTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 15,
    },
    symptomsModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 20,
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        left: 3,
        padding: 6,
    },
    symptomsModalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
        paddingVertical: 8,
    },
    symptomsModalContent: {
        flex: 1,
        paddingHorizontal: 10,
    },
    symptomCategory: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    symptomSectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
        marginBottom: 8,
    },
    symptomButtonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    symptomButton: {
        backgroundColor: "#f7f7f7",
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },
    symptomButtonActive: {
        backgroundColor: "#ff5083",
        borderColor: "#ff5083",
    },
    symptomButtonText: {
        color: "#666",
        fontWeight: "500",
        fontSize: 13,
    },
    symptomButtonTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    notesSection: {
        marginBottom: 20,
    },
    notesInput: {
        minHeight: 90,
        backgroundColor: "#fafafa",
        borderRadius: 10,
        padding: 12,
        textAlignVertical: "top",
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        fontSize: 14,
        color: "#333",
    },
    saveSymptomsButton: {
        backgroundColor: "#ff5083",
        borderRadius: 22,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 24,
        marginBottom: 36,
        shadowColor: "#ff5083",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
    },
    saveSymptomsButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});

export default SymptomModal;
