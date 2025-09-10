import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function partner() {
    return(
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={styles.heading}>Partner</Text>
                <Text style={styles.subheading}>This functionality is comming soon!</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
    },
    heading:{
        fontSize:24,
        fontWeight:'bold',
        textAlign:'center',
    },
    subheading:{
        fontSize:16,
        textAlign:'center',
    }
});