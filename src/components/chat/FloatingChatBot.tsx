"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Moon,
  Sun,
  Paperclip,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  isSleepingNotice?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "bot",
    text: "👋 Hey there! I'm **CampusLens AI Assistant**. I'm currently in **sleeping mode** awaiting backend activation, but you can explore my UI interface!",
    timestamp: "Just now",
  },
  {
    id: "2",
    sender: "bot",
    text: "Try clicking one of the suggested topics below or type a message to see the fluid frontend interactions in action.",
    timestamp: "Just now",
    isSleepingNotice: true,
  },
];

const SUGGESTED_PROMPTS = [
  "🏫 Top CSE Colleges in Delhi NCR",
  "📊 How do JEE Main Cutoffs work?",
  "💰 Compare IIT Bombay vs BITS Pilani",
  "🎯 Admission Chance Predictor",
];

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSleeping, setIsSleeping] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // Simulate bot response after delay
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: isSleeping
          ? `💤 **[Sleeping Mode Active]** I received your message: "${text}". When connected to the AI backend, I will analyze college datasets and cutoffs for you!`
          : `⚡ **[Awake Mode]** Here is a sample response regarding: "${text}". I can help you search cutoffs, NIRF rankings, and placement statistics.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none font-sans">
      {/* ========================================================================= */}
      {/* FLOATING CHAT WINDOW                                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 25, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="mb-4 w-[92vw] sm:w-[390px] h-[540px] max-h-[82vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden ring-1 ring-slate-900/5 dark:ring-slate-100/10"
          >
            {/* WINDOW HEADER */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between relative overflow-hidden">
              {/* Subtle background glow decorative elements */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-3 z-10">
                {/* Bot Avatar with Status Ring */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                      <Bot className="w-5.5 h-5.5 text-blue-400" />
                    </div>
                  </div>
                  {/* Status Indicator Dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                    {isSleeping ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      </>
                    ) : (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-semibold text-sm tracking-tight text-white">CampusLens AI</h3>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  {/* Status pill badge */}
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide border ${
                        isSleeping
                          ? "bg-red-500/15 text-red-300 border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          isSleeping ? "bg-red-400" : "bg-emerald-400"
                        }`}
                      />
                      {isSleeping ? "Sleeping Mode" : "Online"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-1 z-10">
                {/* State Toggle Button (Sleeping / Awake toggle demo) */}
                <button
                  onClick={() => setIsSleeping(!isSleeping)}
                  title={isSleeping ? "Switch to Awake demo" : "Switch to Sleeping mode"}
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  {isSleeping ? <Moon className="w-4 h-4 text-red-400" /> : <Sun className="w-4 h-4 text-amber-300" />}
                </button>

                {/* Reset Chat */}
                <button
                  onClick={resetChat}
                  title="Reset Conversation"
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SLEEPING BANNER NOTICE */}
            <AnimatePresence>
              {isSleeping && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/40 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300"
                >
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span>
                      Bot is <strong>Sleeping</strong> (Frontend UI Demo mode)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSleeping(false)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Wake Up
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CHAT MESSAGES BODY */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-blue-500/10"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3 py-2 rounded-2xl rounded-bl-xs w-max shadow-sm"
                >
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mr-1">
                    {isSleeping ? "Sleeping..." : "Typing"}
                  </span>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                  />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTED PROMPT CHIPS */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                Suggested Prompts
              </p>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs cursor-pointer"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* INPUT FOOTER */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isSleeping
                      ? "Type a message (Bot is sleeping)..."
                      : "Ask about colleges, cutoffs, placements..."
                  }
                  className="w-full pl-3.5 pr-9 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-full border border-transparent focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
                />
                <button
                  type="button"
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
                  title="Attach file (UI demo)"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-full text-white shadow-md transition-all cursor-pointer ${
                  inputValue.trim()
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25 opacity-100"
                    : "bg-slate-300 cursor-not-allowed opacity-60"
                }`}
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FLOATING TRIGGER BUTTON (BOTTOM-RIGHT CORNER)                            */}
      {/* ========================================================================= */}
      <div className="relative group">
        {/* Tooltip on Hover */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute right-0 bottom-full mb-3 whitespace-nowrap bg-slate-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 flex items-center space-x-2 pointer-events-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>CampusLens AI (Sleeping)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Glow Background behind button */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-md opacity-50 group-hover:opacity-100 transition duration-500" />

        {/* Main Launcher Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl flex items-center justify-center border border-indigo-400/30 focus:outline-none focus:ring-4 focus:ring-blue-500/30 cursor-pointer overflow-visible"
          aria-label={isOpen ? "Close Assistant" : "Open CampusLens Assistant"}
        >
          {/* Animated Zzz floating indicator when sleeping & closed */}
          {isSleeping && !isOpen && (
            <motion.div
              initial={{ opacity: 0.7, y: 0 }}
              animate={{ opacity: [0.4, 1, 0.4], y: [-2, -7, -2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -top-2 -left-1 bg-slate-900 border border-slate-700 text-red-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md shadow-md leading-none select-none tracking-tighter"
            >
              Zzz...
            </motion.div>
          )}

          {/* Icon state transition (Bot / Close X) */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Bot className="w-7 h-7 text-blue-300" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* RED SLEEPING STATUS INDICATOR BADGE ON THE ICON */}
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
            <span className="relative flex h-4 w-4">
              {isSleeping ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.9)] items-center justify-center">
                    <span className="w-1 h-1 bg-white rounded-full opacity-80" />
                  </span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                </>
              )}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
