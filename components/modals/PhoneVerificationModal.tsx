"use client";

import React, { useState } from "react";
import { Smartphone, X } from "lucide-react";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  phone,
  onVerified,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<"send" | "verify">("send");
  const [inputPhone, setInputPhone] = useState(phone || "");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone || inputPhone.trim().length < 7) {
      setError("Por favor ingresa un número de teléfono válido.");
      return;
    }
    setError("");
    setStep("verify");
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError("Ingresa el código OTP de 4 dígitos enviado a tu teléfono.");
      return;
    }
    // Simulate valid verification
    setError("");
    setSuccess("¡Teléfono verificado exitosamente!");
    setTimeout(() => {
      onVerified();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#1A261D] border border-amber-600/30 text-amber-100 rounded-2xl p-5 sm:p-6 max-h-[calc(100vh-2rem)] overflow-y-auto max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#F0822D]/20 border border-[#F0822D]/40 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-[#F0822D]" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-amber-200">
              Verificación Telefónica
            </h3>
            <p className="text-xs text-amber-300/80">Requisito obligatorio (RN-01 / HU-03)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl">
            {success}
          </div>
        )}

        {step === "send" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-sm text-amber-100/90 leading-relaxed">
              Para publicar platos o realizar reservas en OllaCercana, debes confirmar tu número de celular.
            </p>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Número de Celular
              </label>
              <input
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="300 123 4567"
                className="w-full bg-[#121A14] border border-amber-700/50 rounded-xl px-4 py-2.5 text-white placeholder-amber-500/40 focus:outline-none focus:border-[#F0822D]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#F0822D] to-[#E06F1A] text-white font-semibold rounded-xl shadow-lg hover:brightness-110 transition-all"
            >
              Enviar Código OTP por SMS
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-amber-100/90 leading-relaxed">
              Hemos enviado un código SMS de prueba a <span className="font-semibold text-amber-300">{inputPhone}</span>. (Usa cualquier código de 4 dígitos, ej: <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">1234</code>)
            </p>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Código OTP de 4 dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="1234"
                className="w-full bg-[#121A14] border border-amber-700/50 rounded-xl px-4 py-2.5 text-center text-2xl tracking-widest text-amber-200 placeholder-amber-500/30 focus:outline-none focus:border-[#62B869]"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("send")}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-amber-200 text-xs font-medium rounded-xl transition-all"
              >
                Cambiar número
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-[#62B869] to-[#4A9950] text-white font-semibold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all"
              >
                Verificar Código
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
