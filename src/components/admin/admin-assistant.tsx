"use client";

import { useState, useEffect, useRef } from "react";
import { HelpCircle, X, Send, Bot, ChevronDown, ChevronUp } from "lucide-react";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (isOpen && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
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

  return (
    <div className="admin-assistant-widget">
      {/* Bouton flottant */}
      <button
        className="assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir l'assistant admin"
      >
        <HelpCircle className="help-icon" />
        <span className="assistant-label">Assistant</span>
        <span className="status-indicator">24/7</span>
      </button>

      {/* Interface de l'assistant */}
      {isOpen && (
        <div className="assistant-panel">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-info">
              <div className="assistant-avatar">
                <Bot className="bot-icon" />
              </div>
              <div className="assistant-details">
                <h3>Assistant KAIRO Admin</h3>
                <span className="status online">24/7</span>
              </div>
            </div>
            <button
              className="close-assistant"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer l'assistant"
            >
              <X className="close-icon" />
            </button>
          </div>

          {/* Section d'aide rapide */}
          <div className="quick-help-section">
            <div className="quick-help-header">
              <h4>Aide rapide</h4>
              <button
                className="expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
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

          {/* Messages */}
          <div className="chat-section">
            <div className="chat-messages">
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender}-message`}
                  >
                    <div className="message-content">{message.message}</div>
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                ))}

                {/* Indicateur de frappe */}
                {isTyping && (
                  <div className="message assistant-message">
                    <div className="message-content typing">
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
            </div>

            {/* Input */}
            <div className="chat-input">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Comment puis-je vous aider ?"
                  rows={1}
                  disabled={isTyping}
                  className="user-input"
                  autoFocus={false}
                  style={{ 
                    opacity: isTyping ? 0.7 : 1,
                    pointerEvents: isTyping ? 'none' : 'auto'
                  }}
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
          background: #007aff;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
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
        }

        .assistant-panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          width: 400px;
          height: 600px;
          max-height: calc(100vh - 80px);
          min-height: 400px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid #e5e5e7;
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
          padding: 16px;
          border-bottom: 1px solid #e5e5e7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
        }

        .assistant-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .assistant-avatar {
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

        .assistant-details h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1f;
        }

        .status.online {
          color: #34c759;
          font-size: 12px;
          font-weight: 500;
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
          padding: 16px;
          border-bottom: 1px solid #e5e5e7;
          background: #f8f9fa;
        }

        .quick-help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
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
        }

        .quick-help-btn {
          background: white;
          border: 1px solid #e9ecef;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1d1d1f;
        }

        .quick-help-btn:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #007aff;
        }

        .quick-help-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chat-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          scroll-behavior: smooth;
          max-height: calc(100vh - 300px);
          min-height: 200px;
          display: flex;
          flex-direction: column;
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
        }

        .message {
          margin-bottom: 0;
        }

        .assistant-message .message-content {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 1.4;
          color: #1d1d1f;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
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

        .user-message .message-content {
          background: #007aff;
          color: white;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 4px;
          margin-left: auto;
          max-width: 80%;
          font-size: 14px;
          line-height: 1.4;
          display: inline-block;
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
          padding: 8px 16px;
          resize: none;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          max-height: 80px;
          transition: all 0.2s ease;
          background: white;
          min-height: 36px;
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
          background: #007aff;
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
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
