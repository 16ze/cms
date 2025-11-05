"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import contentData from "@/config/content.json";
import { SafeHTML } from "@/components/SafeHTML";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  timestamp: Date;
}

interface ChatbotProps {
  apiEndpoint?: string;
  sessionTimeout?: number;
  enableAnalytics?: boolean;
}

export default function KAIROChatbot({
  apiEndpoint = "/api/chatbot",
  sessionTimeout = 30 * 60 * 1000, // 30 minutes
  enableAnalytics = true,
}: ChatbotProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ senderType: string; message: string }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Générer un ID de session unique
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);

    // Message de bienvenue
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      sender: "bot",
      message: contentData.chatbot.welcomeMessage,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gestion de la session timeout
  useEffect(() => {
    if (sessionId) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
        setMessages([
          {
            id: "timeout",
            sender: "bot",
            message: contentData.chatbot.sessionTimeoutMessage,
            timestamp: new Date(),
          },
        ]);
      }, sessionTimeout);

      return () => clearTimeout(timeout);
    }
  }, [sessionId, sessionTimeout]);

  // Actions rapides mises à jour
  const quickActions = [
    { text: "Tarifs", message: "Quel est le prix d'un site ?" },
    { text: "Prendre RDV", message: "Je veux prendre rendez-vous" },
    { text: "SEO", message: "Qu'est-ce que le SEO ?" },
    { text: "E-commerce", message: "Je veux une boutique en ligne" },
  ];

  const handleQuickAction = (message: string) => {
    setInputValue(message);
    handleSendMessage(message);
  };

  const handleSendMessage = async (message?: string) => {
    const msgToSend = message || inputValue.trim();
    if (!msgToSend || isTyping) return;

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: msgToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msgToSend,
          sessionId: sessionId,
          conversationHistory: conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Ajouter la réponse du bot
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          message: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Mettre à jour l'historique
        setConversationHistory((prev) =>
          [
            ...prev,
            { senderType: "user", message: msgToSend },
            { senderType: "bot", message: data.response },
          ].slice(-10)
        ); // Garder seulement les 10 derniers messages

        // Analytics
        if (enableAnalytics) {
          // Envoyer des analytics si nécessaire
          console.log("Chatbot analytics:", {
            sessionId,
            intent: data.intent,
            confidence: data.confidence,
            responseTime: data.responseTime,
          });
        }
      } else {
        throw new Error(data.error || "Erreur de communication");
      }
    } catch (error) {
      console.error("Erreur chatbot:", error);

      // Message d'erreur
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        message:
          "Désolé, je rencontre un problème technique. Veuillez nous contacter directement à contact@kairodigital.fr",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour rendre les liens cliquables
  const renderMessageWithLinks = (message: string) => {
    // Détecter les liens vers la consultation
    const consultationLinkRegex = /\/consultation/g;
    const phoneRegex = /\+33 6 99 80 19 49/g;
    const emailRegex = /contact\.kairodigital@gmail\.com/g;

    let processedMessage = message;

    // Remplacer les liens de consultation par des liens cliquables
    processedMessage = processedMessage.replace(
      consultationLinkRegex,
      '<a href="/consultation" class="chatbot-link consultation-link">page de consultation</a>'
    );

    // Remplacer les numéros de téléphone par des liens cliquables
    processedMessage = processedMessage.replace(
      phoneRegex,
      '<a href="tel:+33699801949" class="chatbot-link phone-link">+33 6 99 80 19 49</a>'
    );

    // Remplacer les emails par des liens cliquables
    processedMessage = processedMessage.replace(
      emailRegex,
      '<a href="mailto:contact.kairodigital@gmail.com" class="chatbot-link email-link">contact.kairodigital@gmail.com</a>'
    );

    return processedMessage;
  };

  // Fonction pour gérer les clics sur les liens
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      e.preventDefault();
      const href = target.getAttribute("href");

      if (href) {
        if (href.startsWith("/")) {
          // Navigation interne
          router.push(href);
        } else if (href.startsWith("tel:")) {
          // Appel téléphonique
          window.open(href);
        } else if (href.startsWith("mailto:")) {
          // Email
          window.open(href);
        } else {
          // Lien externe
          window.open(href, "_blank");
        }
      }
    }
  };

  return (
    <div className="kairo-chatbot-widget">
      {/* Bouton flottant */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le chat"
      >
        <MessageCircle className="chat-icon" />
        {messages.length > 1 && <span className="notification-badge">1</span>}
      </button>

      {/* Interface de chat */}
      {isOpen && (
        <div className="chatbot-interface">
          {/* Header */}
          <div className="chatbot-header">
            <div className="agent-info">
              <div className="agent-avatar">
                <Bot className="bot-icon" />
              </div>
              <div className="agent-details">
                <h4>Assistant KAIRO</h4>
                <span className="status online">En ligne</span>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chat"
            >
              <X className="close-icon" />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender}-message`}
                onClick={handleLinkClick}
              >
                <SafeHTML
                  html={renderMessageWithLinks(message.message)}
                  className="message-bubble"
                  tag="div"
                  onThreatDetected={(threat) => {
                    console.warn("Threat detected in chatbot message:", threat);
                  }}
                />
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="message bot-message">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Actions rapides */}
          {messages.length <= 2 && (
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-btn"
                  onClick={() => handleQuickAction(action.message)}
                  disabled={isTyping}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={contentData.chatbot.placeholder}
                rows={1}
                disabled={isTyping}
                className="user-input"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="send-btn"
                aria-label="Envoyer"
              >
                <Send className="send-icon" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .kairo-chatbot-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            sans-serif;
        }

        .chatbot-toggle {
          width: 60px;
          height: 60px;
          background: #007aff;
          border: none;
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1001;
        }

        .chatbot-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
        }

        .chat-icon {
          width: 24px;
          height: 24px;
          color: white;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff3b30;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .chatbot-interface {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 380px;
          height: 500px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 120px);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
        }

        .chatbot-header {
          padding: 16px 20px;
          background: rgba(247, 247, 247, 0.8);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .agent-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .agent-avatar {
          width: 40px;
          height: 40px;
          background: #007aff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bot-icon {
          width: 20px;
          height: 20px;
          color: white;
        }

        .agent-details h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1f;
        }

        .status {
          font-size: 12px;
          color: #34c759;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .close-icon {
          width: 16px;
          height: 16px;
          color: #8e8e93;
        }

        .chatbot-messages {
          flex: 1;
          padding: 16px 20px;
          overflow-y: auto;
          scroll-behavior: smooth;
        }

        .message {
          margin-bottom: 16px;
        }

        .bot-message .message-bubble {
          background: #f2f2f7;
          color: #1d1d1f;
          padding: 12px 16px;
          border-radius: 18px 18px 18px 6px;
          max-width: 280px;
          font-size: 14px;
          line-height: 1.4;
        }

        .user-message {
          text-align: right;
        }

        .user-message .message-bubble {
          background: #007aff;
          color: white;
          padding: 12px 16px;
          border-radius: 18px 18px 6px 18px;
          max-width: 280px;
          font-size: 14px;
          line-height: 1.4;
          margin-left: auto;
          display: inline-block;
        }

        .message-time {
          font-size: 11px;
          color: #8e8e93;
          margin-top: 4px;
          display: block;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: #8e8e93;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .quick-actions {
          padding: 0 20px 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .quick-btn {
          background: rgba(0, 122, 255, 0.1);
          color: #007aff;
          border: 1px solid rgba(0, 122, 255, 0.2);
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-btn:hover:not(:disabled) {
          background: rgba(0, 122, 255, 0.2);
        }

        .quick-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chatbot-input {
          padding: 16px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .input-container {
          display: flex;
          align-items: end;
          gap: 8px;
        }

        .user-input {
          flex: 1;
          background: #f2f2f7;
          border: none;
          border-radius: 20px;
          padding: 12px 16px;
          font-size: 14px;
          resize: none;
          max-height: 80px;
          font-family: inherit;
          outline: none;
        }

        .user-input:disabled {
          opacity: 0.5;
        }

        .send-btn {
          width: 36px;
          height: 36px;
          background: #007aff;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-btn:hover:not(:disabled) {
          background: #0056d6;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-icon {
          width: 16px;
          height: 16px;
          color: white;
        }

        /* Styles pour les liens cliquables */
        .chatbot-link {
          color: #0066cc !important;
          text-decoration: underline;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .chatbot-link:hover {
          color: #004499 !important;
          text-decoration: none;
          background: rgba(0, 102, 204, 0.1);
          border-radius: 4px;
          padding: 2px 4px;
        }

        .consultation-link {
          font-weight: 600;
          background: rgba(0, 102, 204, 0.15);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid rgba(0, 102, 204, 0.3);
          color: #0066cc !important;
        }

        .consultation-link:hover {
          background: rgba(0, 102, 204, 0.25);
          border-color: rgba(0, 102, 204, 0.5);
          color: #004499 !important;
        }

        .phone-link {
          font-weight: 500;
          color: #0066cc !important;
        }

        .phone-link:hover {
          color: #004499 !important;
        }

        .email-link {
          font-weight: 500;
          color: #0066cc !important;
        }

        .email-link:hover {
          color: #004499 !important;
        }

        /* Responsive Design - Mobile First Approach */
        
        /* Tablettes et petits écrans (768px et moins) */
        @media (max-width: 768px) {
          .chatbot-interface {
            width: calc(100vw - 40px);
            max-width: 400px;
            right: 20px;
            left: auto;
          }
          
          .chatbot-toggle {
            width: 56px;
            height: 56px;
          }
          
          .chat-icon {
            width: 24px;
            height: 24px;
          }
        }
        
        /* Mobiles moyens (480px et moins) */
        @media (max-width: 480px) {
          .chatbot-interface {
            width: calc(100vw - 24px);
            height: calc(100vh - 100px);
            max-height: 500px;
            bottom: 70px;
            right: 12px;
            left: 12px;
            border-radius: 16px;
          }
          
          .chatbot-header {
            padding: 12px 16px;
          }
          
          .chatbot-messages {
            padding: 12px 16px;
          }
          
          .chatbot-input {
            padding: 12px 16px;
          }
          
          .chatbot-toggle {
            width: 52px;
            height: 52px;
            bottom: 20px;
            right: 20px;
          }
          
          .chat-icon {
            width: 22px;
            height: 22px;
          }
        }
        
        /* Très petits écrans (360px et moins) */
        @media (max-width: 360px) {
          .chatbot-interface {
            width: calc(100vw - 16px);
            right: 8px;
            left: 8px;
            border-radius: 12px;
          }
          
          .chatbot-header {
            padding: 10px 12px;
          }
          
          .agent-details h4 {
            font-size: 14px;
          }
          
          .agent-details .status {
            font-size: 11px;
          }
          
          .chatbot-messages {
            padding: 10px 12px;
          }
          
          .message-bubble {
            font-size: 14px;
            padding: 8px 12px;
          }
          
          .chatbot-input {
            padding: 10px 12px;
          }
          
          .user-input {
            font-size: 14px;
            padding: 8px 12px;
          }
          
          .quick-btn {
            font-size: 12px;
            padding: 6px 10px;
          }
        }
        
        /* Mode paysage sur mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .chatbot-interface {
            height: calc(100vh - 60px);
            max-height: 400px;
            bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
}
