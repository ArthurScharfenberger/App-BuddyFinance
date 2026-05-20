import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
            }}
            initialRouteName="SignIn"
        >
            {/* Fluxo de Autenticação */}
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

            {/* App Principal (Tabs) */}
            <Stack.Screen name="MainTabs" component={BottomTabs} />
        </Stack.Navigator>
    );
}
