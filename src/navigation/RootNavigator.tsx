import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import {
    OnboardingCompleteScreen,
    OnboardingExpensesScreen,
    OnboardingGoalScreen,
    OnboardingIncomeScreen,
    OnboardingWelcomeScreen,
} from '../screens/OnboardingScreens';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
            }}
            initialRouteName="OnboardingWelcome"
        >
            <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
            <Stack.Screen name="OnboardingIncome" component={OnboardingIncomeScreen} />
            <Stack.Screen name="OnboardingExpenses" component={OnboardingExpensesScreen} />
            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
            <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />

            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

            <Stack.Screen name="MainTabs" component={BottomTabs} />
        </Stack.Navigator>
    );
}
