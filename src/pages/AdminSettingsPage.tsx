import { useEffect, useState, type FormEvent } from "react";
import { RefreshCw, Save, Settings, Plus, Trash2, Globe, Info } from "lucide-react";
import {
  getGlobalConfig,
  updateGlobalConfig,
} from "../services/userService";
import type { GlobalConfig, GlobalConfigChannel } from "../types/globalConfig";

type ConfigForm = {
  refer_reward: string;
  shortdescription: string;
  welcomemessage: string;
  startmessage: string;
  tokensymbole: string;
  bot_username: string;
  withdrow_message: string;
  channel_list: GlobalConfigChannel[];
};

const emptyForm: ConfigForm = {
  refer_reward: "0.01",
  shortdescription: "",
  welcomemessage: "",
  startmessage: "",
  tokensymbole: "KEA",
  bot_username: "",
  withdrow_message: "",
  channel_list: [],
};

function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toForm(config: GlobalConfig): ConfigForm {
  return {
    refer_reward: String(config.refer_reward ?? 0.01),
    shortdescription: config.shortdescription || "",
    welcomemessage: config.welcomemessage || "",
    startmessage: config.startmessage || "",
    tokensymbole: config.tokensymbole || "KEA",
    bot_username: config.bot_username || "",
    withdrow_message: config.withdrow_message || "",
    channel_list: config.channel_list || [],
  };
}

function toNumber(value: string, fallback = 0) {
  if (value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getErrorMessage(err: unknown, fallback: string) {
  const apiError = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return apiError.response?.data?.message || apiError.message || fallback;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <label className="text-sm text-slate-300 block w-full">
      <span className="text-[9px] text-slate-500 mb-2 block font-black uppercase tracking-[0.2em]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-2xl bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition-all focus:ring-2 focus:ring-cyan-600 border border-slate-700/50 shadow-inner"
        />
      ) : (
        <input
          type={type}
          step={type === "number" ? "0.000001" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition-all focus:ring-2 focus:ring-cyan-600 border border-slate-700/50 shadow-inner"
        />
      )}
    </label>
  );
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadConfig = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getGlobalConfig();
      setConfig(data);
      setForm(toForm(data));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load global config."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const addChannel = () => {
    setForm((current) => ({
      ...current,
      channel_list: [...current.channel_list, { name: "", url: "", reward: 0.005 }],
    }));
  };

  const removeChannel = (index: number) => {
    setForm((current) => ({
      ...current,
      channel_list: current.channel_list.filter((_, i) => i !== index),
    }));
  };

  const updateChannel = (index: number, field: keyof GlobalConfigChannel, value: any) => {
    setForm((current) => {
      const newList = [...current.channel_list];
      newList[index] = { ...newList[index], [field]: value };
      return { ...current, channel_list: newList };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload: any = {
      refer_reward: toNumber(form.refer_reward, 0.01),
      shortdescription: form.shortdescription.trim(),
      welcomemessage: form.welcomemessage.trim(),
      startmessage: form.startmessage.trim(),
      tokensymbole: form.tokensymbole.trim(),
      bot_username: form.bot_username.trim(),
      withdrow_message: form.withdrow_message.trim(),
      channel_list: form.channel_list.map(ch => ({
        ...ch,
        reward: Number(ch.reward)
      })),
    };

    try {
      const data = await updateGlobalConfig(payload);

      if (!data.status) {
        throw new Error(data.message || "Failed to update global config.");
      }

      setConfig(data.data);
      setForm(toForm(data.data));
      setMessage(data.message || "Global config updated successfully.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update global config."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-white w-full max-w-4xl mx-auto pb-20 lg:pb-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl lg:text-2xl font-black tracking-tight">General Settings</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Last updated: {formatDate(config?.updatedAt || config?.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={loadConfig}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800/50 border border-slate-700/30 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-200 transition-all hover:bg-slate-800 disabled:opacity-60 shadow-sm active:scale-95"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Update settings
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-900 bg-red-950/20 px-5 py-4 text-sm text-red-200 animate-in fade-in slide-in-from-top-4">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-2xl border border-green-900 bg-green-950/20 px-5 py-4 text-sm text-green-200 animate-in fade-in slide-in-from-top-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Configuration */}
        <section className="rounded-3xl border border-slate-800 bg-[#131D2D]/50 p-4 lg:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2 lg:gap-3 border-b border-slate-800/50 pb-4">
            <div className="p-1.5 lg:p-2 bg-cyan-500/10 rounded-lg lg:rounded-xl">
                <Settings size={18} className="text-cyan-400 lg:w-[22px] lg:h-[22px]" />
            </div>
            <h4 className="text-sm lg:text-lg font-black uppercase tracking-tighter">Bot Details</h4>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <Field
                label="Bot Username (@)"
                value={form.bot_username}
                onChange={(v) => setForm(f => ({...f, bot_username: v}))}
                placeholder="krybon_bot"
              />
              <Field
                label="Coin Symbol"
                value={form.tokensymbole}
                onChange={(v) => setForm(f => ({...f, tokensymbole: v}))}
                placeholder="KEA"
              />
            </div>
            <div className="space-y-6">
              <Field
                label="Invite Reward"
                type="number"
                value={form.refer_reward}
                onChange={(v) => setForm(f => ({...f, refer_reward: v}))}
                placeholder="0.01"
              />
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/50 shadow-inner">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                    <Info size={14} className="text-cyan-500" />
                    <span>Information</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Changing bot details or rewards will update the Telegram bot immediately. Please check all values.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Messaging System */}
        <section className="rounded-3xl border border-slate-800 bg-[#131D2D]/50 p-4 lg:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2 lg:gap-3 border-b border-slate-800/50 pb-4">
             <div className="p-1.5 lg:p-2 bg-purple-500/10 rounded-lg lg:rounded-xl">
                <Globe size={18} className="text-purple-400 lg:w-[22px] lg:h-[22px]" />
            </div>
            <h4 className="text-sm lg:text-lg font-black uppercase tracking-tighter">Bot Messages</h4>
          </div>

          <div className="space-y-6">
            <Field
              label="Bot Description"
              multiline
              value={form.shortdescription}
              onChange={(v) => setForm(f => ({...f, shortdescription: v}))}
              placeholder="Main description for the bot profile..."
            />
            <Field
              label="Welcome Message"
              multiline
              value={form.welcomemessage}
              onChange={(v) => setForm(f => ({...f, welcomemessage: v}))}
              placeholder="Message for first-time users..."
            />
            <Field
              label="Start Message"
              multiline
              value={form.startmessage}
              onChange={(v) => setForm(f => ({...f, startmessage: v}))}
              placeholder="Message sent when user clicks Start..."
            />
            <Field
              label="Withdraw Message"
              multiline
              value={form.withdrow_message}
              onChange={(v) => setForm(f => ({...f, withdrow_message: v}))}
              placeholder="Message shown on withdraw screen..."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-[#131D2D]/50 p-4 lg:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-800/50 pb-4">
            <div className="flex items-center gap-2 lg:gap-3">
               <div className="p-1.5 lg:p-2 bg-emerald-500/10 rounded-lg lg:rounded-xl">
                    <Globe size={18} className="text-emerald-400 lg:w-[22px] lg:h-[22px]" />
                </div>
              <h4 className="text-sm lg:text-lg font-black uppercase tracking-tighter">Mandatory Channels</h4>
            </div>
            <button
              type="button"
              onClick={addChannel}
              className="flex items-center gap-1.5 lg:gap-2 rounded-lg lg:rounded-xl bg-emerald-600 px-3 lg:px-5 py-2 lg:py-2.5 text-[10px] lg:text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 active:scale-95 whitespace-nowrap"
            >
              <Plus size={14} className="lg:w-[18px] lg:h-[18px]" /> Add Channel
            </button>
          </div>

          <div className="space-y-6">
            {form.channel_list.length === 0 ? (
              <div className="text-center py-12 rounded-3xl border border-dashed border-slate-800 bg-slate-900/20">
                <p className="text-slate-600 text-xs font-black uppercase tracking-widest">No channels added yet.</p>
              </div>
            ) : (
              form.channel_list.map((channel, index) => (
                <div key={index} className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:p-6 transition-all hover:border-slate-700 shadow-inner">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-5 items-stretch md:items-end">
                    <div className="w-full md:col-span-4">
                      <label className="text-[9px] text-slate-500 mb-2 block font-black uppercase tracking-[0.2em]">Channel name</label>
                      <input
                        type="text"
                        value={channel.name}
                        onChange={(e) => updateChannel(index, "name", e.target.value)}
                        placeholder="e.g. Join Official News"
                        className="w-full rounded-xl bg-slate-800/80 px-4 py-3 text-sm text-white outline-none border border-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="w-full md:col-span-5">
                      <label className="text-[9px] text-slate-500 mb-2 block font-black uppercase tracking-[0.2em]">Telegram URL (t.me)</label>
                      <input
                        type="text"
                        value={channel.url}
                        onChange={(e) => updateChannel(index, "url", e.target.value)}
                        placeholder="https://t.me/..."
                        className="w-full rounded-xl bg-slate-800/80 px-4 py-3 text-sm text-white outline-none border border-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="flex items-end gap-3 w-full md:col-span-3">
                      <div className="flex-1">
                        <label className="text-[9px] text-slate-500 mb-2 block font-black uppercase tracking-[0.2em]">Reward amount</label>
                        <input
                          type="number"
                          step="0.001"
                          value={channel.reward}
                          onChange={(e) => updateChannel(index, "reward", e.target.value)}
                          className="w-full rounded-xl bg-slate-800/80 px-4 py-3 text-sm text-white outline-none border border-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChannel(index)}
                        className="p-3 bg-red-900/10 text-red-500 hover:bg-red-950/40 rounded-xl transition-all border border-red-900/30 group-hover:scale-105 mb-[1px]"
                        title="Remove channel"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer Actions */}
        <div className="sticky bottom-20 lg:bottom-6 z-40 flex flex-col sm:flex-row items-center justify-between rounded-2xl lg:rounded-3xl border border-slate-700/50 bg-[#131D2D]/90 backdrop-blur-2xl p-2 lg:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-10 duration-500 mx-1 sm:mx-0">
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
             <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
             <p className="text-[10px] font-black uppercase tracking-widest">System Ready</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => config && setForm(toForm(config))}
              disabled={loading || saving || !config}
              className="flex-1 sm:flex-none rounded-xl lg:rounded-[2rem] bg-transparent border-2 border-slate-800 px-4 py-2.5 text-[10px] lg:text-sm font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:bg-slate-800/30 hover:text-slate-300 disabled:opacity-20 active:scale-95 shadow-inner"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || saving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl lg:rounded-[2rem] bg-[#00A8CC] px-6 py-2.5 text-[10px] lg:text-sm font-black uppercase tracking-[0.1em] text-[#0B1320] transition-all hover:bg-[#00C2EB] hover:shadow-[0_0_30px_rgba(0,168,204,0.4)] disabled:cursor-not-allowed disabled:opacity-40 shadow-xl active:scale-95"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span className="whitespace-nowrap">Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
