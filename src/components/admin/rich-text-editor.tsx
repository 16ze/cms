"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bold, Italic, Underline, List, ListOrdered, Link, Image, 
  AlignLeft, AlignCenter, AlignRight, Code, Quote, Undo, Redo 
} from "lucide-react";
import MediaManager from "./media-manager";
import { useSafeHTML } from "@/components/SafeHTML";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Sanitizer le HTML avant de l'afficher dans l'éditeur
  const sanitizedValue = useSafeHTML(value);

  useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(value);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [value]);

  const saveSelection = () => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const start = range.startOffset;
        const end = range.endOffset;
        setSelection({ start, end });
      }
    }
  };

  const restoreSelection = () => {
    if (selection && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        const textNode = editorRef.current.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, Math.min(selection.start, textNode.textContent?.length || 0));
          range.setEnd(textNode, Math.min(selection.end, textNode.textContent?.length || 0));
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    saveSelection();
    document.execCommand(command, false, value);
    restoreSelection();
    
    // Mettre à jour la valeur
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    setShowMediaManager(true);
  };

  const handleMediaSelect = (media: any) => {
    const imgTag = `<img src="${media.filePath}" alt="${media.altText || media.originalName}" style="max-width: 100%; height: auto;" />`;
    execCommand('insertHTML', imgTag);
    setShowMediaManager(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const isCommandEnabled = (command: string) => {
    return document.queryCommandState(command);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    onClick, 
    title, 
    active = false 
  }: { 
    icon: any; 
    command?: string; 
    onClick?: () => void; 
    title: string; 
    active?: boolean;
  }) => (
    <button
      onClick={onClick || (() => command && execCommand(command))}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
        {/* Formatage de base */}
        <ToolbarButton 
          icon={Bold} 
          command="bold" 
          title="Gras (Ctrl+B)"
          active={isCommandEnabled('bold')}
        />
        <ToolbarButton 
          icon={Italic} 
          command="italic" 
          title="Italique (Ctrl+I)"
          active={isCommandEnabled('italic')}
        />
        <ToolbarButton 
          icon={Underline} 
          command="underline" 
          title="Souligné (Ctrl+U)"
          active={isCommandEnabled('underline')}
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Alignement */}
        <ToolbarButton 
          icon={AlignLeft} 
          command="justifyLeft" 
          title="Aligner à gauche"
        />
        <ToolbarButton 
          icon={AlignCenter} 
          command="justifyCenter" 
          title="Centrer"
        />
        <ToolbarButton 
          icon={AlignRight} 
          command="justifyRight" 
          title="Aligner à droite"
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Listes */}
        <ToolbarButton 
          icon={List} 
          command="insertUnorderedList" 
          title="Liste à puces"
        />
        <ToolbarButton 
          icon={ListOrdered} 
          command="insertOrderedList" 
          title="Liste numérotée"
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Éléments spéciaux */}
        <ToolbarButton 
          icon={Quote} 
          command="formatBlock" 
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          title="Citation"
        />
        <ToolbarButton 
          icon={Code} 
          command="formatBlock" 
          onClick={() => execCommand('formatBlock', '<pre>')}
          title="Code"
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Liens et médias */}
        <ToolbarButton 
          icon={Link} 
          onClick={insertLink}
          title="Insérer un lien"
        />
        <ToolbarButton 
          icon={Image} 
          onClick={insertImage}
          title="Insérer une image"
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Historique */}
        <ToolbarButton 
          icon={Undo} 
          onClick={handleUndo}
          title="Annuler"
          active={historyIndex > 0}
        />
        <ToolbarButton 
          icon={Redo} 
          onClick={handleRedo}
          title="Rétablir"
          active={historyIndex < history.length - 1}
        />
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onInput={(e) => {
          // Le contenu est déjà sanitizer par DOMPurify via sanitizedValue
          // Ici on passe juste le contenu brut car l'éditeur doit permettre l'édition
          onChange(e.currentTarget.innerHTML);
        }}
        onBlur={saveSelection}
        onFocus={restoreSelection}
        dangerouslySetInnerHTML={{ __html: sanitizedValue }}
        placeholder={placeholder}
      />

      {/* Gestionnaire de médias */}
      {showMediaManager && (
        <MediaManager
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaManager(false)}
          multiple={false}
          acceptedTypes={['image/*']}
        />
      )}
    </div>
  );
}
