import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "@/store/auth-context";
import { registerUserRequest } from "@/lib/api";
import {
  AuthBrand,
  AuthCard,
  AuthCheckbox,
  AuthChoice,
  AuthDescription,
  AuthEyebrow,
  AuthField,
  AuthFooter,
  AuthNote,
  AuthScreen,
  AuthStatus,
  AuthSubmit,
  AuthTitle,
} from "@/components/auth";
import { tokens } from "@/theme/tokens";

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
type Country = "SOUTH_AFRICA" | "REST_OF_WORLD";

// Mirrors web `/register` for the User privilege only: same title,
// free-user role card, plan note, fields, helpers, terms checkbox and
// success copy. No role picker — mobile registers users only.
export default function RegisterScreen() {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<Country>("SOUTH_AFRICA");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)/shop");
  }, [loading, user]);

  function missingLabel(): string | null {
    if (!username.trim()) return "username";
    if (!email.trim()) return "email address";
    if (!cellphone.trim()) return "cellphone number";
    if (!gender) return "gender";
    if (!password) return "password";
    return null;
  }

  async function onSubmit() {
    const missing = missingLabel();
    if (missing) {
      setStatus({ tone: "error", message: `Complete ${missing} before submitting.` });
      return;
    }
    if (!email.includes("@")) {
      setStatus({ tone: "error", message: "Enter a valid email address." });
      return;
    }
    if (password.length < 8) {
      setStatus({ tone: "error", message: "Minimum 8 characters with letters and numbers." });
      return;
    }
    if (!terms) {
      setStatus({ tone: "error", message: "Confirm the role and service statement before submitting." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await registerUserRequest({
        username: username.trim(),
        emailAddress: email.trim(),
        cellphoneNumber: cellphone.trim(),
        gender: gender as Gender,
        password,
        localizationCountry: country,
      });
      setStatus({ tone: "success", message: "Account created. Check your inbox for verification before signing in." });
      setUsername("");
      setEmail("");
      setCellphone("");
      setGender("");
      setPassword("");
      setCountry("SOUTH_AFRICA");
      setTerms(false);
    } catch (e) {
      setStatus({ tone: "error", message: e instanceof Error ? e.message : "Unable to reach the auth API." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthBrand />
      <View>
        <AuthEyebrow>Interactive setup</AuthEyebrow>
        <AuthTitle>Register your King Sparkon access</AuthTitle>
        <AuthDescription>
          User registration for tickets, job applications, cart checkout, profile, and purchase QR flows.
          The guidance and form fields below match the website&apos;s free-user form exactly.
        </AuthDescription>
      </View>

      <View style={{ backgroundColor: tokens.ink, borderRadius: 16, padding: 16 }}>
        <Text style={{ color: "#E4C566", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }}>SELECTED ROLE</Text>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 4 }}>Free user</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>
          Tickets, jobs, cart checkout and profile — gender required, no physical address or reference code.
        </Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
          {(["R0", "Tickets", "Cart"] as const).map((tag) => (
            <Text key={tag} style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "900", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
              {tag}
            </Text>
          ))}
        </View>
      </View>

      <AuthNote>
        Selected plan: Free User at R0. Best for tickets, job applications, cart checkout, profile, and purchase QR flows.
      </AuthNote>

      <AuthCard>
        <AuthField
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Example: sparkon_user"
          helper="Required. This becomes your login username."
        />
        <AuthField
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="Example: owner@sparkonstore.co.za"
          keyboardType="email-address"
          helper="Required. Verification and account messages are sent here."
        />
        <AuthField
          label="Cellphone number"
          value={cellphone}
          onChange={setCellphone}
          placeholder="Example: +27821234567"
          keyboardType="phone-pad"
          helper="Required. Use international format for WhatsApp and account contact."
        />
        <AuthChoice<Gender>
          label="Gender"
          value={gender}
          onChange={setGender}
          helper="Required for User. Select your gender."
          options={[
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" },
            { label: "Other", value: "OTHER" },
            { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
          ]}
        />
        <AuthField
          label="Create password"
          value={password}
          onChange={setPassword}
          placeholder="Minimum 8 characters with letters and numbers"
          secure
          helper="Required. Use a strong password for this account."
        />
        <AuthChoice<Country>
          label="Localization country"
          value={country}
          onChange={setCountry}
          helper="Required. Choose South Africa for local pricing, phone, and payment copy."
          options={[
            { label: "South Africa", value: "SOUTH_AFRICA" },
            { label: "Rest of the world", value: "REST_OF_WORLD" },
          ]}
        />
        <AuthCheckbox
          label="I confirm this account is being created for the selected King Sparkon role and service."
          checked={terms}
          onChange={setTerms}
        />
        {status ? <AuthStatus tone={status.tone} message={status.message} /> : null}
        <AuthSubmit title="Create account" busy={busy} onPress={() => void onSubmit()} />
      </AuthCard>
      <AuthFooter text="Already have an account?" href="/(auth)/login" link="Sign in" />
    </AuthScreen>
  );
}
