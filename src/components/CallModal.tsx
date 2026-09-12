import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from "lucide-react";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: { pseudo: string; avatar_url: string | null } | null;
  callType: "audio" | "video";
}

const CallModal = ({ isOpen, onClose, otherUser, callType }: CallModalProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">("calling");
  const [duration, setDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCallStatus("calling");
    setDuration(0);
    setIsMuted(false);
    setIsVideoOff(callType === "audio");

    // Simulate connection after 2s
    const connectTimeout = setTimeout(() => {
      setCallStatus("connected");
    }, 2000);

    // Start local media
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });
        streamRef.current = stream;
        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = stream;
        }
      } catch {
        // Permission denied or no device
      }
    };
    startMedia();

    return () => {
      clearTimeout(connectTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [isOpen, callType]);

  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
  };

  const endCall = () => {
    setCallStatus("ended");
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setTimeout(onClose, 500);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-between"
        >
          {/* Top bar */}
          <div className="w-full flex items-center justify-between px-5 pt-12">
            <button onClick={endCall} className="p-2 rounded-full bg-muted">
              <X className="w-5 h-5 text-foreground" />
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              {callType === "video" ? "Appel vidéo" : "Appel audio"}
            </span>
            <div className="w-9" />
          </div>

          {/* Center: avatar / video */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {callType === "video" && !isVideoOff ? (
              <div className="relative w-64 h-80 rounded-3xl overflow-hidden bg-muted shadow-xl border border-border">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-background/70 px-2 py-1 rounded-lg text-xs text-foreground font-medium">Vous</div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center overflow-hidden shadow-xl">
                {otherUser?.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{(otherUser?.pseudo || "?").charAt(0).toUpperCase()}</span>
                )}
              </div>
            )}
            <p className="text-lg font-bold text-foreground">{otherUser?.pseudo || "..."}</p>
            <p className={`text-sm font-medium ${callStatus === "connected" ? "text-green-500" : callStatus === "ended" ? "text-destructive" : "text-muted-foreground"}`}>
              {callStatus === "calling" && "Appel en cours..."}
              {callStatus === "connected" && formatTime(duration)}
              {callStatus === "ended" && "Appel terminé"}
            </p>
            {callStatus === "calling" && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-16 h-16 rounded-full border-4 border-primary/30"
              />
            )}
          </div>

          {/* Controls */}
          <div className="pb-12 flex items-center gap-6">
            <button onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-destructive/20 text-destructive" : "bg-muted text-foreground"}`}>
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            {callType === "video" && (
              <button onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? "bg-destructive/20 text-destructive" : "bg-muted text-foreground"}`}>
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}
            <button onClick={endCall}
              className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg">
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;
