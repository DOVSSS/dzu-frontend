# Graph Report - frontend  (2026-11-20)

## Corpus Check
- 44 files · ~11,847 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 269 nodes · 577 edges · 24 communities (12 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2362e433`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AuthContext.tsx
- MainTabs.tsx
- RestaurantScreen.tsx
- CartScreen.tsx
- HomeScreen.tsx
- expo
- App.tsx
- dependencies
- package.json
- index.ts
- scripts
- tsconfig.json
- axios
- expo-build-properties@~57.0.22
- expo-constants
- expo-dev-client@~57.0.21
- expo-device
- expo-font@~57.0.4
- expo-image
- expo-splash-screen
- expo-status-bar@~57.0.1
- react-dom@19.2.3
- @react-native-async-storage/async-storage
- react-native-web@~0.21.0

## God Nodes (most connected - your core abstractions)
1. `react` - 23 edges
2. `useAuth()` - 19 edges
3. `react-native` - 17 edges
4. `COLORS` - 14 edges
5. `expo` - 12 edges
6. `HomeScreen()` - 11 edges
7. `CachedRemoteImage()` - 10 edges
8. `@tanstack/react-query` - 9 edges
9. `RestaurantScreen()` - 9 edges
10. `AuthProvider()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `AuthProvider()`  [EXTRACTED]
  App.tsx → src/context/AuthContext.tsx
- `App()` --calls--> `CartProvider()`  [EXTRACTED]
  App.tsx → src/context/CartContext.tsx
- `App()` --calls--> `RootNavigator()`  [EXTRACTED]
  App.tsx → src/navigation/RootNavigator.tsx
- `CartLineRow()` --calls--> `CachedRemoteImage()`  [EXTRACTED]
  src/screens/CartScreen.tsx → src/components/CachedRemoteImage.tsx
- `RestaurantCard` --calls--> `CachedRemoteImage()`  [EXTRACTED]
  src/screens/HomeScreen.tsx → src/components/CachedRemoteImage.tsx

## Import Cycles
- None detected.

## Communities (24 total, 12 thin omitted)

### Community 0 - "AuthContext.tsx"
Cohesion: 0.10
Nodes (26): API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY, AuthContextType, AuthContext, AuthProvider(), api, refreshQueue (+18 more)

### Community 1 - "MainTabs.tsx"
Cohesion: 0.13
Nodes (24): react, @react-navigation/native-stack, COLORS, STATUS_MAP, useAuth(), AppStack(), AppStackParamList, Stack (+16 more)

### Community 2 - "RestaurantScreen.tsx"
Cohesion: 0.10
Nodes (25): CachedRemoteImage(), Props, FULL_IMAGE_WIDTH, ImageViewerModal(), Props, styles, AppStackParamList, Stack (+17 more)

### Community 3 - "CartScreen.tsx"
Cohesion: 0.12
Nodes (24): expo-location@~57.0.22, expo-location, useCart(), queryKeys, CartLineRow(), CartScreen(), styles, OrdersScreen() (+16 more)

### Community 4 - "HomeScreen.tsx"
Cohesion: 0.12
Nodes (21): @expo/vector-icons, react-native, styles, HomeHeader(), styles, RestaurantCatalogSkeleton(), SkeletonCard(), styles (+13 more)

### Community 5 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, foregroundImage, adaptiveIcon, googleServicesFile, package, permissions, predictiveBackGestureEnabled, projectId (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.15
Nodes (15): App(), navigationTheme, @react-navigation/native@^7.2.2, @react-navigation/native, @tanstack/react-query, CartContext, CartContextType, CartLine (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, expo-notifications@~57.0.24, @expo/vector-icons@^15.0.2, react@19.2.3, react-native@0.86.3, react-native-safe-area-context@~5.7.0, react-native-screens@~4.26.0, @react-navigation/bottom-tabs@^7.22.0 (+6 more)

### Community 8 - "package.json"
Cohesion: 0.24
Nodes (9): devDependencies, @types/react@~19.2.4, typescript@~6.0.3, main, name, private, version, @types/react (+1 more)

### Community 9 - "index.ts"
Cohesion: 0.40
Nodes (4): expo@~57.0.31, react-native-gesture-handler@~2.32.0, expo, react-native-gesture-handler

### Community 10 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, android, ios, start, web

### Community 11 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 91 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `MainTabs.tsx` to `AuthContext.tsx`, `RestaurantScreen.tsx`, `CartScreen.tsx`, `HomeScreen.tsx`, `App.tsx`, `dependencies`, `package.json`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `HomeScreen.tsx` to `AuthContext.tsx`, `MainTabs.tsx`, `RestaurantScreen.tsx`, `CartScreen.tsx`, `App.tsx`, `dependencies`, `package.json`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `MainTabs.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13306451612903225 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `CartScreen.tsx`, `App.tsx`, `package.json`, `index.ts`, `axios`, `expo-build-properties@~57.0.22`, `expo-constants`, `expo-dev-client@~57.0.21`, `expo-device`, `expo-font@~57.0.4`, `expo-image`, `expo-splash-screen`, `expo-status-bar@~57.0.1`, `react-dom@19.2.3`, `@react-native-async-storage/async-storage`, `react-native-web@~0.21.0`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `RestaurantScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._