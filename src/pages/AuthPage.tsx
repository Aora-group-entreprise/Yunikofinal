import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ pseudo: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  useAppSettings(); // trigger re-render on lang change

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isLogin && !form.pseudo.trim()) e.pseudo = t("auth.pseudo_required");
    if (!form.email.includes("@")) e.email = t("auth.email_invalid");
    if (form.password.length < 6) e.password = t("auth.password_min");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        toast.success(t("auth.success_login"));
        navigate("/rooms");
      } else {
        const { error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { pseudo: form.pseudo } } });
        if (error) throw error;
        toast.success(t("auth.success_signup"));
        navigate("/rooms");
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border ${errors[field] ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all shadow-sm`;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-10">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold font-display text-gradient">{t("auth.title")}</h1>
          </motion.div>
          <p className="text-muted-foreground text-sm">{t("auth.subtitle")}</p>
        </div>

        <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-8 shadow-sm">
          {[t("auth.login"), t("auth.signup")].map((label, i) => (
            <button key={i} onClick={() => setIsLogin(i === 0)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${(i === 0 ? isLogin : !isLogin) ? "gradient-primary text-primary-foreground shadow-md glow-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isLogin ? 20 : -20 }} className="space-y-4">
            {!isLogin && (
              <div>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder={t("auth.pseudo")} value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} className={inputClass("pseudo")} />
                </div>
                {errors.pseudo && <p className="text-destructive text-xs mt-1">{errors.pseudo}</p>}
              </div>
            )}
            <div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder={t("auth.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass("email")} />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} placeholder={t("auth.password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-lg glow-primary disabled:opacity-50 transition-all">
              {loading ? t("auth.loading") : isLogin ? t("auth.submit_login") : t("auth.submit_signup")}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
