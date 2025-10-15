"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Image, Video, File, Upload, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const MOCK_MEDIA = [
  { id: "1", name: "hero-image.jpg", url: "/images/kairo-hero-img.jpg", type: "image" },
  { id: "2", name: "about-photo.jpg", url: "/images/bryan-photo.jpg", type: "image" },
  { id: "3", name: "service-video.mp4", url: "/videos/Developpement-web.mp4", type: "video" },
  { id: "4", name: "logo.svg", url: "/logo-court.svg", type: "image" },
  { id: "5", name: "background.jpg", url: "/images/grid-pattern.svg", type: "image" }
];

export function MediaSelector({ value, onChange, label }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video">("all");

  const filteredMedia = MOCK_MEDIA.filter(media => {
    const matchesSearch = media.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         media.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || media.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getMediaPreview = (media: any) => {
    if (media.type === "image") {
      return (
        <img
          src={media.url}
          alt={media.name}
          className="w-full h-20 object-cover rounded"
        />
      );
    }
    if (media.type === "video") {
      return (
        <div className="w-full h-20 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
          <Video className="w-8 h-8 text-neutral-400" />
        </div>
      );
    }
    return (
      <div className="w-full h-20 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
        <File className="w-8 h-8 text-neutral-400" />
      </div>
    );
  };

  const handleMediaSelect = (media: any) => {
    onChange(media.url);
    setIsOpen(false);
  };

  const handleCustomUrl = (url: string) => {
    onChange(url);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      <div className="flex items-center space-x-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Sélectionner</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Sélecteur de Média</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col space-y-4">
              {/* Barre de recherche et filtres */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher un média..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("all")}
                  >
                    Tout
                  </Button>
                  <Button
                    variant={selectedType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("image")}
                  >
                    Images
                  </Button>
                  <Button
                    variant={selectedType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("video")}
                  >
                    Vidéos
                  </Button>
                </div>
              </div>

              {/* URL personnalisée */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">URL personnalisée</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={value}
                    onChange={(e) => handleCustomUrl(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomUrl(value)}
                  >
                    Appliquer
                  </Button>
                </div>
              </div>

              {/* Grille des médias */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((media) => (
                    <div
                      key={media.id}
                      className={cn(
                        "group cursor-pointer rounded-lg border-2 transition-all hover:scale-105",
                        value === media.url
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      )}
                      onClick={() => handleMediaSelect(media)}
                    >
                      <div className="relative">
                        {getMediaPreview(media)}
                        
                        {value === media.url && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Eye className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          {getMediaIcon(media.type)}
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                            {media.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate" title={media.name}>
                          {media.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Aperçu du média sélectionné */}
        {value && (
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              {value.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img
                  src={value}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              ) : value.match(/\.(mp4|webm|ogg)$/i) ? (
                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Video className="w-4 h-4 text-neutral-400" />
                </div>
              ) : (
                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <File className="w-4 h-4 text-neutral-400" />
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
