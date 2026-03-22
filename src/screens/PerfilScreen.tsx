// =============================================================================
// BuddyFinance App — src/screens/PerfilScreen.tsx
// Tela de perfil do usuário com configurações e ações da conta.
// TODO: integrar com autenticação real quando o back-end estiver pronto.
// =============================================================================

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../theme/colors';

// ── Constantes ────────────────────────────────────────────────────────────────

const STORAGE_KEY       = '@buddyfinance:data_v2';
const PROFILE_KEY       = '@buddyfinance:profile';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface UserProfile {
    name:  string;
    email: string;
}

interface MenuItem {
    icon:      keyof typeof Ionicons.glyphMap;
    label:     string;
    onPress:   () => void;
    danger?:   boolean;
    rightEl?:  React.ReactNode;
}

// ── Componente: MenuRow ───────────────────────────────────────────────────────

function MenuRow({ icon, label, onPress, danger = false, rightEl }: MenuItem) {
    return (
        <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={[
                menuStyles.iconWrapper,
                { backgroundColor: danger ? theme.colors.dangerMuted : theme.colors.primaryMuted },
            ]}>
                <Ionicons
                    name={icon}
                    size={18}
                    color={danger ? theme.colors.danger : theme.colors.primary}
                />
            </View>
            <Text style={[menuStyles.label, danger && { color: theme.colors.danger }]}>
                {label}
            </Text>
            {rightEl ?? (
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
            )}
        </TouchableOpacity>
    );
}

const menuStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.base,
        gap: theme.spacing.md,
    },
    iconWrapper: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.sm,
    },
    label: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
    },
});

// ── Componente principal ──────────────────────────────────────────────────────

export default function PerfilScreen() {
    const [profile, setProfile]           = useState<UserProfile>({ name: '', email: '' });
    const [editMode, setEditMode]         = useState(false);
    const [editName, setEditName]         = useState('');
    const [editEmail, setEditEmail]       = useState('');
    const [notifEnabled, setNotifEnabled] = useState(true);

    // ── Persistência do perfil ────────────────────────────────────────────────

    const loadProfile = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(PROFILE_KEY);
            if (saved) {
                setProfile(JSON.parse(saved));
            } else {
                // Perfil padrão para novo usuário
                setProfile({ name: 'Meu Nome', email: 'meu@email.com' });
            }
        } catch (error) {
            console.error('[PerfilScreen] Erro ao carregar perfil:', error);
        }
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const saveProfile = useCallback(async () => {
        const updated: UserProfile = {
            name:  editName.trim()  || profile.name,
            email: editEmail.trim() || profile.email,
        };
        try {
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
            setProfile(updated);
            setEditMode(false);
        } catch (error) {
            console.error('[PerfilScreen] Erro ao salvar perfil:', error);
        }
    }, [editName, editEmail, profile]);

    const enterEditMode = () => {
        setEditName(profile.name);
        setEditEmail(profile.email);
        setEditMode(true);
    };

    // ── Apagar dados locais ───────────────────────────────────────────────────

    const handleClearData = () => {
        Alert.alert(
            'Apagar todos os dados?',
            'Esta ação removerá todas as suas transações e não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(STORAGE_KEY);
                            Alert.alert('Pronto', 'Todos os dados foram removidos.');
                        } catch (error) {
                            console.error('[PerfilScreen] Erro ao limpar dados:', error);
                        }
                    },
                },
            ],
        );
    };

    // ── Iniciais do avatar ────────────────────────────────────────────────────

    const initials = profile.name
        .split(' ')
        .slice(0, 2)
        .map(n => n[0]?.toUpperCase() ?? '')
        .join('');

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Cabeçalho ── */}
                <View style={styles.headerSection}>
                    <Text style={styles.screenTitle}>Perfil</Text>
                </View>

                {/* ── Avatar + nome ── */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials || '?'}</Text>
                    </View>

                    {editMode ? (
                        /* Modo edição */
                        <View style={styles.editForm}>
                            <TextInput
                                style={styles.editInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Seu nome"
                                placeholderTextColor={theme.colors.textFaint}
                            />
                            <TextInput
                                style={styles.editInput}
                                value={editEmail}
                                onChangeText={setEditEmail}
                                placeholder="seu@email.com"
                                placeholderTextColor={theme.colors.textFaint}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setEditMode(false)}
                                >
                                    <Text style={styles.cancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={saveProfile}
                                >
                                    <Text style={styles.saveText}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        /* Modo visualização */
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{profile.name}</Text>
                            <Text style={styles.profileEmail}>{profile.email}</Text>

                            {/* Badge de plano */}
                            <View style={styles.planBadge}>
                                <Ionicons name="star" size={11} color={theme.colors.primary} />
                                <Text style={styles.planText}>Plano Gratuito</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ── Seção Conta ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conta</Text>
                    <View style={styles.menuCard}>
                        <MenuRow
                            icon="person-outline"
                            label="Editar perfil"
                            onPress={enterEditMode}
                        />
                        <View style={styles.menuDivider} />
                        <MenuRow
                            icon="diamond-outline"
                            label="Upgrade para Pro"
                            onPress={() => Alert.alert('Em breve', 'Planos chegam na próxima versão!')}
                        />
                    </View>
                </View>

                {/* ── Seção Preferências ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferências</Text>
                    <View style={styles.menuCard}>
                        <MenuRow
                            icon="notifications-outline"
                            label="Notificações"
                            onPress={() => setNotifEnabled(p => !p)}
                            rightEl={
                                <Switch
                                    value={notifEnabled}
                                    onValueChange={setNotifEnabled}
                                    trackColor={{
                                        false: theme.colors.border,
                                        true:  theme.colors.primary,
                                    }}
                                    thumbColor="#ffffff"
                                />
                            }
                        />
                        <View style={styles.menuDivider} />
                        <MenuRow
                            icon="shield-outline"
                            label="Privacidade e segurança"
                            onPress={() => Alert.alert('Em breve', 'Disponível em breve.')}
                        />
                    </View>
                </View>

                {/* ── Seção Suporte ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suporte</Text>
                    <View style={styles.menuCard}>
                        <MenuRow
                            icon="help-circle-outline"
                            label="Central de ajuda"
                            onPress={() => Alert.alert('Em breve', 'Disponível em breve.')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuRow
                            icon="document-text-outline"
                            label="Termos de uso"
                            onPress={() => Alert.alert('Em breve', 'Disponível em breve.')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuRow
                            icon="information-circle-outline"
                            label="Versão 1.0.0"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* ── Seção Perigo ── */}
                <View style={[styles.section, { marginBottom: theme.spacing.xxxl }]}>
                    <Text style={styles.sectionTitle}>Zona de perigo</Text>
                    <View style={styles.menuCard}>
                        <MenuRow
                            icon="trash-outline"
                            label="Apagar todos os dados"
                            onPress={handleClearData}
                            danger
                        />
                        <View style={styles.menuDivider} />
                        <MenuRow
                            icon="log-out-outline"
                            label="Sair da conta"
                            onPress={() => Alert.alert('Em breve', 'Login disponível na próxima versão.')}
                            danger
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
    },
    headerSection: {
        marginTop: theme.spacing.base,
        marginBottom: theme.spacing.lg,
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.xxl,
        fontWeight: theme.typography.black,
        letterSpacing: -0.5,
    },

    // Card do perfil
    profileCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xl,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    avatarText: {
        color: '#ffffff',
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.black,
    },
    profileInfo: {
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    profileName: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
    },
    profileEmail: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sm,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryMuted,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.pill,
        gap: theme.spacing.xs,
        marginTop: theme.spacing.xs,
    },
    planText: {
        color: theme.colors.primary,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
    },

    // Form de edição
    editForm: {
        width: '100%',
        gap: theme.spacing.sm,
    },
    editInput: {
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        fontSize: theme.typography.base,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    editActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.xs,
    },
    cancelBtn: {
        flex: 1,
        padding: theme.spacing.md,
        alignItems: 'center',
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelText: {
        color: theme.colors.textMuted,
        fontWeight: theme.typography.bold,
    },
    saveBtn: {
        flex: 2,
        padding: theme.spacing.md,
        alignItems: 'center',
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
    },
    saveText: {
        color: '#ffffff',
        fontWeight: theme.typography.bold,
    },

    // Seções de menu
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        color: theme.colors.textFaint,
        fontSize: theme.typography.xs,
        fontWeight: theme.typography.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
    },
    menuCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.base,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuDivider: {
        height: 1,
        backgroundColor: theme.colors.borderSoft,
    },
});
