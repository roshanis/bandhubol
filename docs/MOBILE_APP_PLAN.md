# 📱 BandhuBol Mobile App Plan

## Overview

This document outlines the strategy to bring BandhuBol to iOS and Android as native mobile apps.

---

## 🎯 Recommended Approach: **React Native + Expo**

Given your existing React/TypeScript codebase, **Expo (React Native)** is the best choice:

| Factor | Why Expo/React Native |
|--------|----------------------|
| **Code Reuse** | Reuse `@bandhubol/core` package directly |
| **Skills** | Same React + TypeScript knowledge |
| **Speed** | Single codebase for iOS + Android |
| **Features** | Built-in audio, push notifications, storage |
| **Updates** | Over-the-air updates without app store review |

---

## 🏗️ Architecture

```
bandhubol/
├── apps/
│   ├── web/              # Existing Next.js web app
│   └── mobile/           # NEW: Expo React Native app
│       ├── app/          # Expo Router screens
│       ├── components/   # Mobile UI components
│       ├── hooks/        # Mobile-specific hooks
│       └── assets/       # Icons, splash screens
├── packages/
│   ├── core/             # SHARED: Business logic (already exists)
│   └── ui/               # NEW: Shared UI components
└── package.json          # Monorepo root
```

---

## 📋 Development Phases

### Phase 1: Project Setup (Week 1)
- [ ] Initialize Expo app in `apps/mobile`
- [ ] Configure monorepo to share `@bandhubol/core`
- [ ] Set up Expo Router for navigation
- [ ] Configure environment variables

### Phase 2: Core Features (Weeks 2-3)
- [ ] Chat screen with avatar selection
- [ ] Message input and display
- [ ] API integration (reuse existing endpoints)
- [ ] Local message caching (AsyncStorage)

### Phase 3: Voice Features (Week 4)
- [ ] Audio playback for TTS responses
- [ ] Speech-to-text input (optional)
- [ ] Background audio support

### Phase 4: Native Features (Week 5)
- [ ] Push notifications for check-ins
- [ ] Haptic feedback
- [ ] Dark/light mode
- [ ] Offline support

### Phase 5: Polish & Launch (Weeks 6-7)
- [ ] App icons and splash screens
- [ ] App Store / Play Store assets
- [ ] TestFlight / Internal testing
- [ ] Submit for review

---

## 🛠️ Technical Implementation

### 1. Initialize Expo App

```bash
# From project root
cd apps
npx create-expo-app mobile --template expo-template-blank-typescript

# Add to workspace
cd ..
# Update package.json workspaces if needed
```

### 2. Configure Monorepo Sharing

Update `apps/mobile/package.json`:
```json
{
  "name": "@bandhubol/mobile",
  "dependencies": {
    "@bandhubol/core": "*",
    "expo": "~52.0.0",
    "expo-av": "~14.0.0",
    "expo-router": "~4.0.0",
    "react-native": "0.76.0"
  }
}
```

### 3. Metro Config for Monorepo

Create `apps/mobile/metro.config.js`:
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

### 4. API Configuration

Create `apps/mobile/src/config/api.ts`:
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Local development
  : 'https://your-production-url.vercel.app';

export const endpoints = {
  chat: `${API_BASE_URL}/api/chat`,
  tts: `${API_BASE_URL}/api/tts`,
};
```

### 5. Chat Hook (Mobile Version)

```typescript
// apps/mobile/src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../config/api';
import type { ConversationMessage, AvatarPersona } from '@bandhubol/core';

export function useChat(avatar: AvatarPersona) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoints.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          avatarId: avatar.id,
          languagePreference: 'hinglish',
        }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);
      
      // Cache locally
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } finally {
      setIsLoading(false);
    }
  }, [avatar, messages]);

  return { messages, isLoading, send };
}
```

### 6. Audio Playback

```typescript
// apps/mobile/src/hooks/useAudio.ts
import { Audio } from 'expo-av';
import { endpoints } from '../config/api';

export function useAudio(avatarId: string) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = async (text: string) => {
    const response = await fetch(endpoints.tts, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, avatarId }),
    });
    
    const blob = await response.blob();
    const uri = URL.createObjectURL(blob);
    
    const { sound } = await Audio.Sound.createAsync({ uri });
    setIsPlaying(true);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) setIsPlaying(false);
    });
  };

  return { speak, isPlaying };
}
```

---

## 📱 Key Screens

### 1. Home / Avatar Selection
```
┌─────────────────────────┐
│      BandhuBol          │
│                         │
│  Choose your companion  │
│                         │
│  ┌─────┐  ┌─────┐      │
│  │ 🌸  │  │ 🌿  │      │
│  │Riya │  │Arjun│      │
│  └─────┘  └─────┘      │
│  ┌─────┐  ┌─────┐      │
│  │ ✨  │  │ 🔮  │      │
│  │Meera│  │Kabir│      │
│  └─────┘  └─────┘      │
│                         │
└─────────────────────────┘
```

### 2. Chat Screen
```
┌─────────────────────────┐
│  ← Riya 🌸              │
├─────────────────────────┤
│                         │
│      Hi! How are you    │
│      feeling today?     │
│              🔈         │
│                         │
│         I'm feeling a   │
│         bit stressed    │
│                         │
│      I understand...    │
│              🔈         │
│                         │
├─────────────────────────┤
│ ┌─────────────────┐ 📤  │
│ │ Type message... │     │
│ └─────────────────┘     │
└─────────────────────────┘
```

---

## 🔔 Push Notifications

Use Expo Notifications for gentle check-ins:

```typescript
import * as Notifications from 'expo-notifications';

// Schedule daily check-in
await Notifications.scheduleNotificationAsync({
  content: {
    title: "How are you feeling? 🌸",
    body: "Riya is here if you want to talk",
  },
  trigger: {
    hour: 20,
    minute: 0,
    repeats: true,
  },
});
```

---

## 📦 App Store Requirements

### iOS (App Store)
- [ ] Apple Developer Account ($99/year)
- [ ] App icons (1024x1024)
- [ ] Screenshots (6.7", 6.5", 5.5")
- [ ] Privacy policy URL
- [ ] App description & keywords

### Android (Play Store)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone, tablet)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire

---

## 💰 Cost Estimate

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Account | $25 (one-time) |
| Expo EAS Build | Free tier available |
| **Total to Launch** | **~$125** |

---

## 🚀 Quick Start Commands

```bash
# 1. Create the mobile app
cd apps
npx create-expo-app mobile -t expo-template-blank-typescript

# 2. Install dependencies
cd mobile
npm install @bandhubol/core expo-av expo-router @react-native-async-storage/async-storage

# 3. Start development
npx expo start

# 4. Run on device
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app for physical device
```

---

## 📅 Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup | 1 week | Working Expo app with core integration |
| Chat | 2 weeks | Full chat functionality |
| Voice | 1 week | TTS playback |
| Polish | 2 weeks | Native features, UI polish |
| Launch | 1 week | App store submissions |
| **Total** | **7 weeks** | **Production apps** |

---

## ❓ Alternative Approaches

### Option B: Capacitor (Wrap Web App)
- **Pros**: Fastest, reuse 100% of web code
- **Cons**: Less native feel, larger app size
- **Best for**: Quick MVP

### Option C: Flutter
- **Pros**: Best performance, beautiful UI
- **Cons**: Learn Dart, rewrite UI, can still use core via API
- **Best for**: If prioritizing animations/performance

### Option D: Native (Swift + Kotlin)
- **Pros**: Best possible experience
- **Cons**: 2x development effort, separate codebases
- **Best for**: Large team, long-term investment

---

## Next Steps

1. **Decide on approach** (Expo recommended)
2. **Set up developer accounts** (Apple + Google)
3. **Initialize mobile app** in monorepo
4. **Start Phase 1** development

Ready to start? Let me know and I can help scaffold the mobile app! 🚀

