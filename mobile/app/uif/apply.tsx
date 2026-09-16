import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

const documents = [
  { type: "UI-19", title: "UI-19", description: "Employment termination declaration" },
  { type: "SALARY_SCHEDULE", title: "Salary Schedule", description: "Salary history from your employer" },
  { type: "UIF_2_8", title: "UIF 2.8", description: "UIF declaration form" },
  { type: "ID_COPY", title: "ID Copy", description: "Certified copy of your ID document" },
];

export default function UifApplyScreen() {
  const [ready, setReady] = useState<Set<string>>(new Set());

  function toggle(type: string) {
    setReady((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const complete = ready.size === documents.length;

  return (
    <Screen>
      <Title>Apply for UIF Benefits</Title>
      <Subtitle>Mirrors web `/dashboard/user/uif/apply`. Tick off each document as you prepare it.</Subtitle>
      <Card>
        {documents.map((doc) => {
          const done = ready.has(doc.type);
          return (
            <Pressable key={doc.type} style={styles.row} onPress={() => toggle(doc.type)}>
              <View style={[styles.box, done && styles.boxDone]}>
                {done ? <Text style={styles.tick}>✓</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docDesc}>{doc.description}</Text>
              </View>
            </Pressable>
          );
        })}
        <StatusPill label={complete ? "Ready to submit" : `${ready.size}/${documents.length} documents ready`} tone={complete ? "success" : "neutral"} />
      </Card>
      <Card>
        <Text style={styles.docDesc}>Submit the pack through official UIF channels, then track progress here:</Text>
        <Link href="/uif/status" style={styles.link}>
          Check UIF Status →
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tokens.line },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: tokens.lineStrong, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  boxDone: { backgroundColor: tokens.confirm, borderColor: tokens.confirm },
  tick: { color: "#fff", fontWeight: "900" },
  docTitle: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  docDesc: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  link: { color: tokens.signalStrong, fontWeight: "800" },
});
