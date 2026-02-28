import { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  FlatList,
  Pressable,
  View,
  ImageBackground,
  Image,
  Dimensions,
  Platform
} from "react-native";

// ---------- Types ----------
type Regulation = { label: string; value: string };
type Species = {
  name: string;
  minInches: number | null;
  bagLimit: number;
  season: string;
  notes?: string;
};
type River = {
  id: string;
  name: string;
  county?: string;
  class?: string;
  location?: string;
  species?: Species[];
  regulations?: Regulation[];
};

// ---------- Safe data load ----------
let rivers: River[] = [];
let dataError: string | null = null;
try {
  // @ts-ignore
  rivers = require("./rivers.json") as River[];
  if (!Array.isArray(rivers)) throw new Error("rivers.json is not an array");
} catch (e: any) {
  dataError = "Could not load rivers.json. Check JSON format and file location.";
  console.error(dataError, e);
}

// ---------- Background handling ----------
const { width, height } = Dimensions.get("window");
let bgSource: any = null;
try {
  bgSource = require("../../assets/background.jpg");
} catch {
  console.warn("Background image not found at assets/background.jpg");
}

// Extra padding at bottom so content can scroll above the tab bar
const TAB_BAR_BUFFER = 80;

// Show ALL regulation rows in this order:
const ALL_REG_LABELS = [
  "Fishing Season",
  "Possession Season",
  "Brook Trout Minimum Size (in)",
  "Brown Trout Minimum Size (in)",
  "Salmon/Lake/Rainbow/Splake Minimum Size (in)",
  "All Trout & Salmon Daily Possession Limit"
];

export default function HomeScreen() {
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<River | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const detailListRef = useRef<FlatList>(null);

  // Scroll to top when a river is selected
  useEffect(() => {
    if (selected && detailListRef.current) {
      detailListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [selected]);

  // Prefetch background (guarded) for PWA caching
  useEffect(() => {
    try {
      if (bgSource) {
        const src = (Image as any)?.resolveAssetSource?.(bgSource)?.uri;
        if (src && typeof (Image as any).prefetch === "function") {
          (Image as any).prefetch(src).catch(() => {});
        }
      }
    } catch {}
  }, []);

  // Robust filter: name, county, class, location, species names
  const filtered: River[] = (rivers || []).filter((r: River) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const nameHit   = r.name?.toLowerCase().includes(q);
    const countyHit = r.county?.toLowerCase().includes(q);
    const classHit  = r.class?.toLowerCase().includes(q);
    const locHit    = r.location?.toLowerCase().includes(q);
    const speciesList = Array.isArray(r.species) ? r.species : [];
    const speciesHit  = speciesList.some((s) => s.name?.toLowerCase().includes(q));
    return !!nameHit || !!countyHit || !!classHit || !!locHit || speciesHit;
  });

  const Content = (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "transparent" }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            marginBottom: 12,
            color: "#fff",
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3
          }}
        >
          Rules & Regulations
        </Text>

        {(dataError || imgError) && (
          <Text style={{ color: "#ffdddd", marginBottom: 8 }}>
            {dataError ? "Data error: " + dataError : ""}
            {imgError ? (dataError ? " • " : "") + "Image error: " + imgError : ""}
          </Text>
        )}

        {!selected && (
          <TextInput
            placeholder="Search rivers or lakes..."
            placeholderTextColor="#ccc"
            value={query}
            onChangeText={setQuery}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 12,
              marginBottom: 16,
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "#111"
            }}
          />
        )}

        {selected ? (
          // ---------- SCROLLABLE DETAIL VIEW ----------
          <FlatList
            ref={detailListRef}
            key={selected.id}
            style={{ flex: 1 }}
            // Build a list that contains EVERY regulation row in the desired order,
            // showing "—" where the CSV had an empty value.
            data={ALL_REG_LABELS.map((label) => {
              const found = (selected.regulations ?? []).find(r => r.label === label);
              return { label, value: found && found.value ? found.value : "—" };
            })}
            keyExtractor={(r) => r.label}
            ListHeaderComponent={
              <View style={{ marginBottom: 12 }}>
                <Pressable onPress={() => setSelected(null)} style={{ marginBottom: 12 }}>
                  <Text style={{ color: "#4da6ff", fontSize: 16 }}>← Back</Text>
                </Pressable>

                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: 6,
                    textShadowColor: "rgba(0,0,0,0.4)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2
                  }}
                >
                  {selected.name}
                </Text>

                {/* Meta line: County • Class • Location (only present parts) */}
                <Text style={{ color: "#ddd", marginBottom: 12 }}>
                  {[selected.county, selected.class, selected.location].filter(Boolean).join(" • ")}
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#e6e6e6",
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 12
                }}
              >
                <Text style={{ fontSize: 15, color: "#111", fontWeight: "600" }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 15, color: "#111", marginTop: 2 }}>
                  {item.value}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: TAB_BAR_BUFFER }}
          />
        ) : (
          // ---------- LIST VIEW (shows county + location) ----------
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: TAB_BAR_BUFFER }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelected(item)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  backgroundColor: "#e6e6e6",
                  borderRadius: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2
                }}
              >
                <Text style={{ fontSize: 16, color: "#111" }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
                  {item.county ? item.county : "County unknown"}
                  {item.location ? ` • ${item.location}` : ""}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#fff" }}>
                No rivers found. Try another name, county, or location.
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );

  if (!bgSource) {
    return <View style={{ width, height, backgroundColor: "#0b1c2c" }}>{Content}</View>;
  }

  return (
    <ImageBackground
      source={bgSource}
      style={{ width, height }}
      resizeMode="cover"
      onError={() => setImgError("assets/background.jpg not found")}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>{Content}</View>
    </ImageBackground>
  );
}
