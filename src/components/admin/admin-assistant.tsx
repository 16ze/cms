"use client";

import { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  X,
  Send,
  Bot,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";

interface AdminMessage {
  id: string;
  sender: "user" | "assistant";
  message: string;
  timestamp: Date;
}

interface AdminAssistantProps {
  apiEndpoint?: string;
  sessionTimeout?: number;
  enableAnalytics?: boolean;
}

export default function AdminAssistant({
  apiEndpoint = "/api/admin/assistant",
  sessionTimeout = 30 * 60 * 1000, // 30 minutes
  enableAnalytics = true,
}: AdminAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ senderType: string; message: string }>
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Générer un ID de session unique
  useEffect(() => {
    const newSessionId = `admin_session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);

    // Message de bienvenue
    const welcomeMessage: AdminMessage = {
      id: "welcome",
      sender: "assistant",
      message:
        "Salut ! 👋 Je suis votre assistant admin KAIRO 24/7.\n\n📚 J'ai accès au guide complet d'utilisation de l'espace admin. Je peux vous aider avec :\n\n• Comment gérer les réservations\n• Comment ajouter/modifier des clients\n• Comment modifier le contenu du site\n• Comment configurer Google Analytics\n• Dépannage et résolution de problèmes\n• Et bien plus encore !\n\nPosez-moi n'importe quelle question, je suis là pour vous guider étape par étape ! 🚀",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll vers le bas avec délai pour s'assurer que le DOM est mis à jour
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    };

    // Petit délai pour s'assurer que le DOM est mis à jour
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Focus sur l'input quand l'assistant s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, isMinimized]);

  // Gérer les messages non lus
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "assistant") {
        setUnreadCount((prev) => prev + 1);
      }
    } else {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape pour fermer
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
      // Ctrl/Cmd + K pour ouvrir/fermer
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Gestion de la session timeout
  useEffect(() => {
    if (sessionId) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
        setMessages([
          {
            id: "timeout",
            sender: "assistant",
            message:
              "Session expirée. N'hésitez pas à rouvrir l'assistant si vous avez d'autres questions !",
            timestamp: new Date(),
          },
        ]);
      }, sessionTimeout);

      return () => clearTimeout(timeout);
    }
  }, [sessionId, sessionTimeout]);

  // Actions rapides pour l'admin - Basées sur le guide complet
  const quickHelpActions = [
    {
      text: "Ajouter un client",
      message: "Comment ajouter un nouveau client ?",
    },
    {
      text: "Confirmer une réservation",
      message: "Comment confirmer une réservation ?",
    },
    {
      text: "Modifier le contenu",
      message: "Comment modifier le contenu d'une page ?",
    },
    {
      text: "Gérer les réservations",
      message: "Comment gérer les réservations ?",
    },
    {
      text: "Google Analytics",
      message: "Comment configurer Google Analytics ?",
    },
    {
      text: "Rôles et permissions",
      message: "Quelle est la différence entre Admin et Super Admin ?",
    },
    { text: "Problème de connexion", message: "J'ai un problème de connexion" },
    {
      text: "Problème d'upload",
      message: "J'ai un problème d'upload de fichiers",
    },
    {
      text: "Lien Google Analytics",
      message: "Donne-moi le lien vers Google Analytics",
    },
    {
      text: "Lien Search Console",
      message: "Donne-moi le lien vers Google Search Console",
    },
  ];

  const handleQuickAction = (message: string) => {
    // Ouvrir la section d'aide si elle est fermée
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setInputValue(message);
    handleSendMessage(message);
  };

  const handleSendMessage = async (message?: string) => {
    const msgToSend = message || inputValue.trim();
    if (!msgToSend || isTyping) return;

    // Ajouter le message utilisateur
    const userMessage: AdminMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: msgToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Maintenir le focus sur l'input après l'envoi
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

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
        // Ajouter la réponse de l'assistant
        const assistantMessage: AdminMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          message: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Mettre à jour l'historique
        setConversationHistory((prev) =>
          [
            ...prev,
            { senderType: "user", message: msgToSend },
            { senderType: "assistant", message: data.response },
          ].slice(-10)
        ); // Garder seulement les 10 derniers messages

        // Analytics
        if (enableAnalytics) {
          console.log("Admin assistant analytics:", {
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
      console.error("Erreur assistant admin:", error);

      // Message d'erreur
      const errorMessage: AdminMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        message:
          "Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter le support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      // Remettre le focus sur l'input après la réponse
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
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

  // Fonction pour copier un message
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  // Fonction pour formater les liens dans les messages
  const formatMessageContent = (content: string) => {
    // Détection des URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Fonction pour gérer l'ouverture/fermeture avec animation
  const toggleAssistant = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="admin-assistant-widget">
      {/* Bouton flottant */}
      <button
        className="assistant-toggle"
        onClick={toggleAssistant}
        aria-label={
          isOpen ? "Fermer l'assistant admin" : "Ouvrir l'assistant admin"
        }
        title="Assistant Admin (Ctrl+K)"
      >
        <HelpCircle className="help-icon" />
        <span className="assistant-label">Assistant</span>
        <span className="status-indicator">24/7</span>
        {unreadCount > 0 && !isOpen && (
          <span
            className="unread-badge"
            aria-label={`${unreadCount} nouveau(x) message(s)`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Interface de l'assistant */}
      {isOpen && (
        <div className={`assistant-panel ${isMinimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-info">
              <div className="assistant-avatar">
                <Bot className="bot-icon" />
              </div>
              <div className="assistant-details">
                <h3>Assistant KAIRO Admin</h3>
                <span className="status online">
                  <span className="status-dot"></span>
                  En ligne 24/7
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="minimize-assistant"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Agrandir" : "Réduire"}
                title={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? (
                  <ChevronUp className="action-icon" />
                ) : (
                  <Minimize2 className="action-icon" />
                )}
              </button>
              <button
                className="close-assistant"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer l'assistant"
                title="Fermer (Esc)"
              >
                <X className="close-icon" />
              </button>
            </div>
          </div>

          {/* Section d'aide rapide */}
          {!isMinimized && (
            <div className="quick-help-section">
              <div
                className="quick-help-header"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <h4>Aide rapide</h4>
                <button
                  className="expand-btn"
                  aria-label={isExpanded ? "Réduire" : "Développer"}
                >
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
            {isExpanded && (
              <div className="quick-help-buttons">
                {quickHelpActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-help-btn"
                    onClick={() => handleQuickAction(action.message)}
                    disabled={isTyping}
                  >
                    {action.text}
                  </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {!isMinimized && (
            <div className="chat-section">
              <div className="chat-messages" ref={chatContainerRef}>
                <div className="messages-container">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.sender}-message`}
                    >
                      <div className="message-wrapper">
                        <div className="message-content">
                          {formatMessageContent(message.message)}
                        </div>
                        {message.sender === "assistant" && (
                          <button
                            className="copy-btn"
                            onClick={() =>
                              handleCopyMessage(message.id, message.message)
                            }
                            aria-label="Copier le message"
                            title="Copier"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="copy-icon copied" />
                            ) : (
                              <Copy className="copy-icon" />
                            )}
                          </button>
                        )}
                      </div>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  ))}

                  {/* Indicateur de frappe */}
                  {isTyping && (
                    <div className="message assistant-message">
                      <div className="message-wrapper">
                        <div className="message-content typing">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="chat-input">
                <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  rows={1}
                  disabled={isTyping}
                  className="user-input"
                  autoFocus={false}
                  aria-label="Champ de saisie du message"
                  style={{
                    opacity: isTyping ? 0.7 : 1,
                    pointerEvents: isTyping ? "none" : "auto",
                    overflow: "hidden",
                    resize: "none",
                  }}
                />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="send-btn"
                    aria-label="Envoyer le message"
                    title="Envoyer (Entrée)"
                  >
                    <Send className="send-icon" />
                  </button>
                </div>
                <div className="input-hint">
                  Astuce : Utilisez <kbd>Ctrl+K</kbd> pour ouvrir/fermer
                  l'assistant
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .admin-assistant-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            sans-serif;
        }

        .assistant-toggle {
          background: linear-gradient(135deg, #007aff 0%, #0056d6 100%);
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .assistant-toggle::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }

        .assistant-toggle:hover::before {
          left: 100%;
        }

        @media (max-width: 768px) {
          .assistant-toggle {
            padding: 10px 14px;
            font-size: 13px;
            border-radius: 20px;
          }

          .help-icon {
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 480px) {
          .assistant-toggle {
            padding: 8px 12px;
            font-size: 12px;
            gap: 6px;
            border-radius: 18px;
          }

          .help-icon {
            width: 14px;
            height: 14px;
          }

          .status-indicator {
            padding: 1px 4px;
            font-size: 10px;
          }
        }

        .assistant-toggle:hover {
          background: #0056d6;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
        }

        .help-icon {
          width: 18px;
          height: 18px;
        }

        .status-indicator {
          background: #34c759;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .unread-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff3b30;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
          animation: bounce 0.5s ease-out, pulse 2s ease-in-out infinite 0.5s;
        }

        @keyframes bounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .assistant-panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          width: 420px;
          height: 650px;
          max-height: calc(100vh - 80px);
          min-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid #e5e5e7;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom right;
        }

        .assistant-panel.minimized {
          height: auto;
          max-height: 60px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .assistant-panel {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            max-height: calc(100vh - 120px);
            bottom: 60px;
            right: 20px;
            left: 20px;
            border-radius: 8px;
          }

          .assistant-header {
            padding: 12px;
          }

          .assistant-avatar {
            width: 32px;
            height: 32px;
          }

          .bot-icon {
            width: 16px;
            height: 16px;
          }

          .chat-messages {
            padding: 12px;
            max-height: calc(100vh - 250px);
            min-height: 150px;
          }

          .messages-container {
            gap: 12px;
            padding-bottom: 12px;
          }

          .chat-input {
            padding: 12px;
          }

          .user-input {
            font-size: 13px;
            padding: 6px 12px;
          }

          .quick-help-buttons {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .quick-help-btn {
            padding: 6px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .admin-assistant-widget {
            bottom: 10px;
            right: 10px;
            left: 10px;
          }

          .assistant-panel {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            max-height: calc(100vh - 100px);
            bottom: 60px;
            right: 10px;
            left: 10px;
            border-radius: 6px;
          }

          .assistant-header {
            padding: 10px;
          }

          .assistant-avatar {
            width: 28px;
            height: 28px;
          }

          .bot-icon {
            width: 14px;
            height: 14px;
          }

          .chat-messages {
            padding: 10px;
            max-height: calc(100vh - 200px);
            min-height: 120px;
          }

          .messages-container {
            gap: 10px;
            padding-bottom: 10px;
          }

          .chat-input {
            padding: 10px;
          }

          .user-input {
            font-size: 12px;
            padding: 5px 10px;
            border-radius: 15px;
          }

          .send-btn {
            padding: 6px;
            width: 32px;
            height: 32px;
          }

          .send-icon {
            width: 14px;
            height: 14px;
          }

          .quick-help-section {
            padding: 12px;
          }

          .quick-help-buttons {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .quick-help-btn {
            padding: 5px 8px;
            font-size: 11px;
            border-radius: 6px;
          }
        }

        .assistant-header {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e5e7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          flex-shrink: 0;
          min-height: 60px;
        }

        .assistant-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .assistant-avatar {
          width: 38px;
          height: 38px;
          background: #007aff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bot-icon {
          width: 20px;
          height: 20px;
          color: white;
        }

        .assistant-details h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1d1d1f;
        }

        .status.online {
          color: #34c759;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #34c759;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(52, 199, 89, 0.6);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .minimize-assistant {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .minimize-assistant:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .action-icon {
          width: 16px;
          height: 16px;
          color: #8e8e93;
        }

        .close-assistant {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .close-assistant:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .close-icon {
          width: 16px;
          height: 16px;
          color: #8e8e93;
        }

        .quick-help-section {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e5e7;
          background: #f8f9fa;
          flex-shrink: 0;
        }

        .quick-help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          cursor: pointer;
          padding: 4px 0;
        }

        .quick-help-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1d1d1f;
        }

        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .expand-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .quick-help-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .quick-help-buttons::-webkit-scrollbar {
          width: 4px;
        }

        .quick-help-buttons::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .quick-help-buttons::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .quick-help-buttons::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .quick-help-btn {
          background: white;
          border: 1px solid #e9ecef;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #1d1d1f;
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .quick-help-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(0, 122, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }

        .quick-help-btn:hover:not(:disabled)::before {
          width: 200%;
          height: 200%;
        }

        .quick-help-btn:hover:not(:disabled) {
          border-color: #007aff;
          color: #007aff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 122, 255, 0.15);
        }

        .quick-help-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .quick-help-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chat-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 16px;
          flex: 1;
        }

        .message {
          margin-bottom: 0;
          animation: messageSlideIn 0.3s ease-out;
        }

        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          position: relative;
        }

        .assistant-message .message-wrapper:hover .copy-btn {
          opacity: 1;
        }

        .assistant-message .message-content {
          background: #f8f9fa;
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 1.6;
          color: #1d1d1f;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          flex: 1;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.2s ease;
        }

        .assistant-message .message-content:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .copy-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 3px;
          border-radius: 3px;
          opacity: 0;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .copy-btn:hover {
          background: rgba(0, 122, 255, 0.1);
        }

        .copy-icon {
          width: 12px;
          height: 12px;
          color: #8e8e93;
        }

        .copy-icon.copied {
          color: #34c759;
        }

        .message-link {
          color: #007aff;
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 122, 255, 0.3);
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .message-link:hover {
          border-bottom-color: #007aff;
          background: rgba(0, 122, 255, 0.05);
        }

        @media (max-width: 768px) {
          .assistant-message .message-content {
            padding: 10px;
            font-size: 13px;
            border-radius: 10px;
          }

          .user-message .message-content {
            padding: 10px;
            font-size: 13px;
            border-radius: 10px;
            max-width: 90%;
          }
        }

        @media (max-width: 480px) {
          .assistant-message .message-content {
            padding: 8px;
            font-size: 12px;
            border-radius: 8px;
          }

          .user-message .message-content {
            padding: 8px;
            font-size: 12px;
            border-radius: 8px;
            max-width: 95%;
          }

          .message-time {
            font-size: 10px;
          }
        }

        .user-message {
          text-align: right;
        }

        .user-message .message-wrapper {
          justify-content: flex-end;
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #007aff 0%, #0056d6 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 18px 18px 4px 18px;
          margin-bottom: 4px;
          margin-left: auto;
          max-width: 80%;
          font-size: 14px;
          line-height: 1.6;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
          transition: box-shadow 0.2s ease;
        }

        .user-message .message-content:hover {
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }

        .message-time {
          font-size: 11px;
          color: #8e8e93;
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

        .chat-input {
          padding: 16px;
          border-top: 1px solid #e5e5e7;
          background: white;
          position: sticky;
          bottom: 0;
          z-index: 10;
          flex-shrink: 0;
        }

        .input-container {
          display: flex;
          gap: 8px;
          align-items: end;
        }

        .user-input {
          flex: 1;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          padding: 10px 16px;
          resize: none;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          max-height: 80px;
          min-height: 40px;
          transition: all 0.2s ease;
          background: white;
          line-height: 1.4;
          overflow: hidden;
        }

        .user-input:focus {
          border-color: #007aff;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
        }

        .user-input:disabled {
          opacity: 0.7;
          background: #f8f9fa;
        }

        .user-input:not(:disabled) {
          opacity: 1;
          background: white;
        }

        .send-btn {
          background: linear-gradient(135deg, #007aff 0%, #0056d6 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }

        .send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #c7c7cc;
        }

        .send-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }

        .send-btn:hover:not(:disabled) .send-icon {
          transform: translateX(2px);
        }

        .input-hint {
          margin-top: 8px;
          font-size: 11px;
          color: #8e8e93;
          text-align: center;
          opacity: 0.8;
        }

        .input-hint kbd {
          background: #f8f9fa;
          border: 1px solid #e5e5e7;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 10px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .assistant-panel {
            width: calc(100vw - 32px);
            height: calc(100vh - 120px);
            bottom: 60px;
            right: 16px;
            left: 16px;
          }

          .quick-help-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
