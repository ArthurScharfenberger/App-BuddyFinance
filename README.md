# BuddyFinance — App Mobile

App mobile do BuddyFinance, minha plataforma de gestão financeira pessoal com inteligência de mercado em tempo real.

O mesmo produto do site, agora no celular. Controle de gastos, analisador de ativos, educação financeira e perfil — tudo em uma navegação fluida por abas.

---

## Telas

| Tela | O que faz |
|------|-----------|
| **Início** | Saldo, resumo de orçamento, atalhos rápidos e transações recentes |
| **Histórico** | Todas as transações com filtros por tipo e agrupamento por mês |
| **Investir** | Analisador ao vivo de Ibovespa, Cripto e FIIs com atualização a cada 30s |
| **Aprender** | Dicas financeiras (50/30/20, fundo de emergência, juros compostos) e artigos |
| **Perfil** | Edição de dados, preferências, configurações e zona de perigo |

---

## Stack

- **React Native** + **Expo SDK 54**
- **TypeScript**
- **React Navigation** — navegação por abas inferiores
- **AsyncStorage** — persistência local de transações e perfil
- **Expo Vector Icons** — ícones Ionicons

---

## Estrutura

```
buddy-finance-app/
│
├── App.tsx                          ← Entry point
│
├── src/
│   ├── theme/
│   │   └── colors.ts                ← Sistema de design centralizado
│   │
│   ├── components/
│   │   ├── BalanceCard.tsx          ← Card de saldo com resumo
│   │   ├── BuddyMascot.tsx          ← Mascote com variantes de estado
│   │   ├── CustomButton.tsx         ← Botão com variantes e loading
│   │   ├── TransactionItem.tsx      ← Item de transação na lista
│   │   └── TransactionModal.tsx     ← Modal de adicionar receita/despesa
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TransacoesScreen.tsx
│   │   ├── InvestimentosScreen.tsx
│   │   ├── EducacaoScreen.tsx
│   │   └── PerfilScreen.tsx
│   │
│   └── navigation/
│       └── BottomTabs.tsx
│
└── assets/
    ├── logo.png
    ├── logoapp.png
    └── mascot.png
```

---

## Como rodar

```bash
# Instala dependências
npm install

# Inicia o servidor de desenvolvimento
npx expo start
```

Com o servidor rodando, escaneie o QR code pelo **Expo Go** (iOS ou Android) ou pressione `a` para Android emulado / `i` para iOS simulado.

---

## Decisões técnicas

**Tema centralizado** — todas as cores, tamanhos de fonte, espaçamentos e raios estão em `src/theme/colors.ts`. Alterar a cor primária em um único lugar reflete em todo o app. Identidade visual alinhada com o site (`#0052FF`).

**Persistência local** — os dados de transações e perfil ficam no `AsyncStorage` com a chave `@buddyfinance:data_v2`. Não há dependência de backend para o app funcionar offline.

**Sem `any`** — o projeto usa TypeScript de forma estrita. Todos os componentes e funções têm tipos explícitos.

**Analisador simulado** — os dados de mercado são mock estático em `InvestimentosScreen`. Os pontos de integração estão marcados com `TODO` para quando a API estiver pronta.

---

## O que ainda falta para produção

- [ ] Integrar autenticação real (login/cadastro via API)
- [ ] Substituir mock de mercado pela API real (Brapi, Yahoo Finance etc.)
- [ ] Sincronizar transações com backend
- [ ] Implementar artigos completos na tela Aprender
- [ ] Adicionar notificações push para alertas de preço
- [ ] Configurar EAS Build para gerar `.apk` e `.ipa`

---

© 2026 BuddyFinance
