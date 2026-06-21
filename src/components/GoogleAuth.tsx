import { useState } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { User, LogOut, Key, Settings, Chrome, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function GoogleAuth() {
  const { userProfile, apiKey, setUserProfile, setApiKey } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);

  const handleGoogleLogin = () => {
    // Simulated Google OAuth Flow with high-fidelity mock profile
    const mockUser = {
      name: 'Creative Spriter',
      email: 'spriter.pro@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
    };
    setUserProfile(mockUser);
  };

  const handleSignOut = () => {
    setUserProfile(null);
  };

  const handleSaveApiKey = () => {
    setIsSaving(true);
    setTimeout(() => {
      setApiKey(tempKey);
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="relative">
      {userProfile ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-slate-900/60 hover:bg-slate-800/80 transition-all text-xs font-medium cursor-pointer"
          >
            <img src={userProfile.avatar} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-accent/40" />
            <span className="text-text-primary hidden sm:inline">{userProfile.name}</span>
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border border-border bg-slate-900/50 hover:bg-slate-800/80 text-xs font-semibold text-text-secondary cursor-pointer"
        >
          <Chrome className="w-4 h-4 text-blue-400" />
          <span>Connect Google</span>
        </Button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-slate-950/95 backdrop-blur-md shadow-2xl p-4 z-[999] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              INTEGRATION SETTINGS
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Google Connection Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Account</span>
            {userProfile ? (
              <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-lg border border-border/60">
                <div className="flex items-center gap-2">
                  <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-accent/40" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">{userProfile.name}</span>
                    <span className="text-[10px] text-text-secondary">{userProfile.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-md transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-text-primary transition-all cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-blue-400" />
                Sign in with Google
              </button>
            )}
          </div>

          {/* Gemini API Key Section */}
          <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3 h-3 text-accent" />
              Gemini API Credentials
            </span>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Gemini API Key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="flex-1 text-xs bg-slate-900/50"
              />
              <Button
                size="sm"
                onClick={handleSaveApiKey}
                className="bg-accent text-white px-2.5 flex items-center justify-center gap-1 cursor-pointer"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="animate-spin text-xs">...</span>
                ) : apiKey === tempKey && apiKey !== '' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              API key enables instant sprite generation using Imagen 3 model via Google GenAI. Kept safe in localStorage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
