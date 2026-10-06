import { useEffect, useState, useRef, DragEvent } from "react";
import {
  Image as ImageIcon,
  Upload,
  Globe,
  Eye,
  Grid,
  Star,
  X,
  ChevronRight,
  Plus,
  Check,
  CheckCircle,
  Move,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { contentToSections } from "../utils/articleContent";

type MediaSource = "upload" | "wordpress" | "unsplash";

interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  source: MediaSource;
  width?: number;
  height?: number;
}

interface MediaAssetResponse {
  id: string;
  filename: string;
  public_url: string;
  alt_text: string | null;
  source: string;
}

interface ArticleImage {
  id: string;
  mediaId: string;
  position: "featured" | "thumbnail" | number; // number = after section index
  caption?: string;
}

interface Section {
  id: string;
  type: string;
  heading: string;
  body: string;
}

const MOCK_WORDPRESS_MEDIA: MediaItem[] = [
  {
    id: "wp-1",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    title: "Dashboard analytics startup",
    source: "wordpress",
    width: 1200,
    height: 800,
  },
  {
    id: "wp-2",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    title: "Croissance business",
    source: "wordpress",
    width: 1200,
    height: 675,
  },
  {
    id: "wp-3",
    url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
    title: "Team collaboration startup",
    source: "wordpress",
    width: 1200,
    height: 800,
  },
  {
    id: "wp-4",
    url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400",
    title: "Stratégie marketing digital",
    source: "wordpress",
    width: 1200,
    height: 800,
  },
];

interface VisualEnrichmentProps {
  articleId: string | null;
  sections: Section[];
  title: string;
  onBack: () => void;
  onNext: () => void;
  onPublish: () => void;
}

export function VisualEnrichment({ articleId, sections, title, onBack, onNext, onPublish }: VisualEnrichmentProps) {
  const [loadedArticle, setLoadedArticle] = useState<{ title: string; content: string } | null>(null);
  const [articleLoading, setArticleLoading] = useState(Boolean(articleId));
  const [articleError, setArticleError] = useState<string | null>(null);
  const [articleImages, setArticleImages] = useState<ArticleImage[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(MOCK_WORDPRESS_MEDIA);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [selectedSource, setSelectedSource] = useState<MediaSource>("wordpress");
  const [draggedMedia, setDraggedMedia] = useState<MediaItem | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | "featured" | "thumbnail" | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("http://localhost:3001/api/media", { signal: controller.signal })
      .then(async response => {
        const result = await response.json() as MediaAssetResponse[] | { error?: string };
        if (!response.ok) throw new Error(Array.isArray(result) ? "Impossible de charger la bibliothèque média." : result.error || "Impossible de charger la bibliothèque média.");
        const assets = Array.isArray(result) ? result : [];
        const uploadedMedia: MediaItem[] = assets.map(asset => ({
          id: asset.id,
          url: asset.public_url,
          thumbnail: asset.public_url,
          title: asset.alt_text || asset.filename,
          source: "upload",
        }));
        const fetchedIds = new Set(uploadedMedia.map(media => media.id));
        setMediaLibrary(previous => [
          ...previous.filter(media => media.source !== "upload" || !fetchedIds.has(media.id)),
          ...uploadedMedia,
        ]);
      })
      .catch(error => {
        if (error instanceof Error && error.name === "AbortError") return;
        setUploadError(error instanceof Error ? error.message : "Impossible de charger la bibliothèque média.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!articleId) {
      setLoadedArticle(null);
      setArticleError(null);
      setArticleLoading(false);
      return;
    }
    const controller = new AbortController();
    setArticleLoading(true);
    setArticleError(null);
    void fetch(`http://localhost:3001/api/articles/${encodeURIComponent(articleId)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(response.status === 404 ? "Cet article n'existe plus." : "Impossible de charger l'article.");
        const article = await response.json() as { title: string | null; content: string | null };
        setLoadedArticle({ title: article.title || "Article sans titre", content: article.content || "" });
      })
      .catch(error => {
        if (error instanceof Error && error.name === "AbortError") return;
        setArticleError(error instanceof Error ? error.message : "Erreur pendant le chargement de l'article.");
      })
      .finally(() => { if (!controller.signal.aborted) setArticleLoading(false); });
    return () => controller.abort();
  }, [articleId]);

  const displayedTitle = articleId ? loadedArticle?.title || "Chargement de l'article..." : title;
  const displayedSections = articleId
    ? loadedArticle ? contentToSections(loadedArticle.content) : []
    : sections;

  const featuredImage = articleImages.find((img) => img.position === "featured");
  const thumbnailImage = articleImages.find((img) => img.position === "thumbnail");

  const handleValidate = () => {
    const warnings: string[] = [];
    if (!featuredImage) warnings.push("Aucune image à la une n'a été ajoutée.");
    if (!thumbnailImage) warnings.push("Aucune miniature n'a été définie.");
    const hasInlineImage = articleImages.some((img) => typeof img.position === "number");
    if (!hasInlineImage) warnings.push("Aucun visuel n'a été ajouté dans le contenu de l'article.");
    if (warnings.length === 0) {
      onPublish();
    } else {
      setValidationWarnings(warnings);
      setShowValidationModal(true);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setUploadError("Format non accepté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Le fichier dépasse la taille maximale de 10 Mo.");
      return;
    }
    setUploadError(null);
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setUploadPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.currentTarget.value = "";
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const response = await fetch("http://localhost:3001/api/media/upload", { method: "POST", body: formData });
      const result = await response.json() as MediaAssetResponse | { error?: string };
      if (!response.ok || !("public_url" in result)) {
        throw new Error("error" in result ? result.error || "Impossible d'importer cette image." : "Impossible d'importer cette image.");
      }
      const newMedia: MediaItem = {
        id: result.id,
        url: result.public_url,
        thumbnail: result.public_url,
        title: result.alt_text || result.filename,
        source: "upload",
      };
      setMediaLibrary((prev) => [newMedia, ...prev]);
      setSelectedSource("upload");
      setUploadModalOpen(false);
      setUploadPreview(null);
      setUploadFile(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Impossible de joindre le backend NexusSEO.");
    } finally {
      setUploading(false);
    }
  };

  const handleModalDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleModalDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleModalDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    handleFileSelect(files);
  };

  const handleDragStart = (media: MediaItem) => {
    setDraggedMedia(media);
  };

  const handleDragOver = (e: DragEvent, position: number | "featured" | "thumbnail") => {
    e.preventDefault();
    setDragOverPosition(position);
  };

  const handleDrop = (e: DragEvent, position: number | "featured" | "thumbnail") => {
    e.preventDefault();
    if (!draggedMedia) return;

    // Remove existing image at this position
    setArticleImages((prev) => prev.filter((img) => img.position !== position));

    // Add new image
    const newImage: ArticleImage = {
      id: `img-${Date.now()}`,
      mediaId: draggedMedia.id,
      position,
    };
    setArticleImages((prev) => [...prev, newImage]);

    setDraggedMedia(null);
    setDragOverPosition(null);
  };

  const removeImage = (position: number | "featured" | "thumbnail") => {
    setArticleImages((prev) => prev.filter((img) => img.position !== position));
  };

  const getMediaById = (mediaId: string): MediaItem | undefined => {
    return mediaLibrary.find((m) => m.id === mediaId);
  };

  const ImageSlot = ({
    position,
    label,
    aspect = "video",
  }: {
    position: number | "featured" | "thumbnail";
    label: string;
    aspect?: "video" | "square";
  }) => {
    const image = articleImages.find((img) => img.position === position);
    const media = image ? getMediaById(image.mediaId) : undefined;
    const isOver = dragOverPosition === position;

    return (
      <div
        className={`relative group rounded-xl border-2 border-dashed transition-all ${
          isOver
            ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
            : media
            ? "border-purple-500/30 bg-[#070d22]"
            : "border-purple-500/15 bg-[#0b1028]/50 hover:border-purple-500/30"
        } ${aspect === "video" ? "aspect-video" : "aspect-square"}`}
        onDragOver={(e) => handleDragOver(e, position)}
        onDrop={(e) => handleDrop(e, position)}
      >
        {media ? (
          <>
            <img src={media.url} alt={media.title} className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => removeImage(position)}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[10px] text-white/80 font-medium truncate">{media.title}</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 p-4">
            <ImageIcon size={24} className="opacity-40" />
            <p className="text-xs font-medium">{label}</p>
            <p className="text-[10px] text-slate-600 text-center">Glissez une image ici</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#050816]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-purple-500/20 bg-[#080e28]/90 backdrop-blur-sm flex-wrap gap-y-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white text-xs transition-all"
        >
          <ArrowLeft size={11} /> Retour à l'édition
        </button>

        <div className="flex items-center gap-1 text-xs font-mono flex-wrap">
          {["Recherche SEO", "Génération", "Édition", "Enrichissement", "Révision", "Publication"].map((step, i) => (
            <span key={step} className="flex items-center gap-1">
              <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                i === 3
                  ? "text-white bg-purple-600/50 border-purple-400/60 font-semibold shadow-lg shadow-purple-500/20"
                  : i < 3
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                  : "text-slate-500 border-transparent"
              }`}>
                {i < 3 && <span className="mr-1">✓</span>}{step}
              </span>
              {i < 5 && <ChevronRight size={10} className={i < 3 ? "text-emerald-500/50" : "text-slate-700"} />}
            </span>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "edit"
                ? "bg-purple-600 text-white"
                : "bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon size={11} className="inline mr-1.5" />
            Édition
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-purple-600 text-white"
                : "bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white"
            }`}
          >
            <Eye size={11} className="inline mr-1.5" />
            Prévisualisation
          </button>
          <div className="w-px h-6 bg-purple-500/20 mx-1" />
          <button
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
          >
            <CheckCircle size={11} /> Passer en révision
          </button>
          <button
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
          >
            <Check size={11} /> Valider
          </button>
        </div>
      </div>

      {articleError && <p className="px-5 py-2 text-sm text-rose-300">{articleError}</p>}
      {articleLoading && <p className="px-5 py-2 text-sm text-slate-400">Chargement de l'article...</p>}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "edit" ? (
          <>
            {/* Zone d'édition */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Images principales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">Images principales</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-slate-300 font-medium">Image à la une</label>
                        <span className="text-[10px] text-slate-500 font-mono bg-[#070d22] px-2 py-0.5 rounded border border-purple-500/15">1200 × 630 px · max 5 Mo</span>
                      </div>
                      <ImageSlot position="featured" label="Image à la une" aspect="video" />
                    </div>
                    <div>
                      <div className="flex flex-col gap-1 mb-2">
                        <label className="text-xs text-slate-300 font-medium">Miniature</label>
                        <span className="text-[10px] text-slate-500 font-mono bg-[#070d22] px-2 py-0.5 rounded border border-purple-500/15">800 × 450 px · max 2 Mo</span>
                      </div>
                      <ImageSlot position="thumbnail" label="Miniature" aspect="square" />
                    </div>
                  </div>
                </div>

                {/* Images dans le contenu */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">Images dans l'article</h3>
                  </div>

                  <div className="space-y-3">
                    {displayedSections.map((section, index) => {
                      const image = articleImages.find((img) => img.position === index);
                      const media = image ? getMediaById(image.mediaId) : undefined;

                      return (
                        <div key={section.id} className="space-y-2">
                          {/* Section header */}
                          <div className="px-3 py-2 rounded-lg bg-[#070d22] border border-purple-500/10">
                            <p className="text-xs font-medium text-purple-300">
                              {section.type === "intro" ? "Introduction" : section.heading || `Section ${index + 1}`}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{section.body}</p>
                          </div>

                          {/* Image slot after this section */}
                          <div
                            className={`relative rounded-xl border-2 border-dashed transition-all ${
                              dragOverPosition === index
                                ? "border-purple-500 bg-purple-500/10"
                                : media
                                ? "border-purple-500/30 bg-[#070d22]"
                                : "border-purple-500/10 bg-[#0b1028]/30 hover:border-purple-500/20"
                            } ${media ? "p-0" : "p-4"}`}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            {media ? (
                              <div className="relative group">
                                <img
                                  src={media.url}
                                  alt={media.title}
                                  className="w-full h-48 object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-xs text-white font-medium">{media.title}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-slate-600">
                                <Plus size={16} className="opacity-50" />
                                <div>
                                  <p className="text-xs font-medium">Insérer une image après cette section</p>
                                  <p className="text-[10px] text-slate-700">
                                    Glissez une image de la bibliothèque
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bibliothèque média */}
            <div className="w-80 flex-shrink-0 border-l border-purple-500/10 overflow-y-auto bg-[#070d22]/40">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                    Bibliothèque média
                  </h3>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-all text-xs font-medium"
                  >
                    <Upload size={12} />
                    Importer une image
                  </button>
                </div>

                {/* Source tabs */}
                <div className="flex gap-1 p-1 rounded-lg bg-[#0b1028]">
                  {[
                    { id: "wordpress" as const, label: "WordPress", icon: Globe },
                    { id: "upload" as const, label: "Bibliothèque média", icon: Upload },
                  ].map((src) => (
                    <button
                      key={src.id}
                      onClick={() => setSelectedSource(src.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedSource === src.id
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <src.icon size={10} />
                      {src.label}
                    </button>
                  ))}
                </div>

                {uploadError && <p className="text-[10px] text-rose-300" role="alert">{uploadError}</p>}

                {/* Media grid */}
                <div className="grid grid-cols-2 gap-2">
                  {mediaLibrary
                    .filter((m) => m.source === selectedSource)
                    .map((media) => (
                      <div
                        key={media.id}
                        draggable
                        onDragStart={() => handleDragStart(media)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-move group border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-[1.02]"
                      >
                        <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute top-1 right-1">
                            <Move size={12} className="text-white drop-shadow-lg" />
                          </div>
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-[9px] text-white font-medium truncate">{media.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {mediaLibrary.filter((m) => m.source === selectedSource).length === 0 && (
                  <div className="text-center py-8 text-slate-600">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Aucune image disponible</p>
                    <p className="text-[10px] text-slate-700 mt-1">
                      {selectedSource === "upload" ? "Uploadez vos images" : "Connectez WordPress"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Prévisualisation */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Featured image */}
              {featuredImage && getMediaById(featuredImage.mediaId) && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                  <img
                    src={getMediaById(featuredImage.mediaId)!.url}
                    alt="Featured"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1
                className="text-4xl font-bold text-white mb-6 leading-tight"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {displayedTitle}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-8 pb-8 border-b border-purple-500/10">
                <span>26 mai 2025</span>
                <span>•</span>
                <span>Sarah Connor</span>
                <span>•</span>
                <span>9 min de lecture</span>
              </div>

              {/* Content with images */}
              <div className="space-y-6">
                {displayedSections.map((section, index) => {
                  const image = articleImages.find((img) => img.position === index);
                  const media = image ? getMediaById(image.mediaId) : undefined;

                  return (
                    <div key={section.id}>
                      {section.type === "section" && section.heading && (
                        <h2 className="text-xl font-semibold text-purple-300 mb-3">{section.heading}</h2>
                      )}
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">{section.body}</p>

                      {media && (
                        <div className="my-8 rounded-xl overflow-hidden">
                          <img src={media.url} alt={media.title} className="w-full h-auto" />
                          {image.caption && (
                            <p className="text-xs text-slate-500 italic mt-2 text-center">{image.caption}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4">
            <div className="bg-[#0b1028] border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/10">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-purple-400" />
                  <h3 className="text-base font-semibold text-white">Uploader une image</h3>
                </div>
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    setUploadPreview(null);
                    setUploadFile(null);
                    setUploadError(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-purple-500/10 text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Upload Area */}
              <div className="p-6">
                {!uploadPreview ? (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
                      dragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-purple-500/20 hover:border-purple-500/40 bg-[#070d22]/50"
                    }`}
                    onDragOver={handleModalDragOver}
                    onDragLeave={handleModalDragLeave}
                    onDrop={handleModalDrop}
                  >
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Upload size={28} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300 mb-1">
                          Glissez-déposez votre image ici
                        </p>
                        <p className="text-xs text-slate-500">ou</p>
                      </div>
                      <button
                        onClick={() => uploadRef.current?.click()}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:scale-105 transition-transform"
                      >
                        Parcourir vos fichiers
                      </button>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-500">PNG, JPG, WebP — Taille maximale : 5 Mo</p>
                        <div className="flex gap-3 justify-center text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">Image à la une : 1200 × 630 px</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Miniature : 800 × 450 px</span>
                          <span className="px-2 py-0.5 rounded bg-[#070d22] border border-purple-500/15 text-slate-400">Inline : 900 × 500 px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative rounded-xl overflow-hidden bg-[#070d22] border border-purple-500/10">
                      <img src={uploadPreview} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setUploadPreview(null); setUploadFile(null); setUploadError(null); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#070d22] border border-purple-500/15 text-slate-400 hover:text-white text-sm transition-all"
                      >
                        <X size={14} />
                        Changer d'image
                      </button>
                      <button
                        onClick={handleUploadConfirm}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Upload en cours...
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            Ajouter à l'article
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {uploadError && <p className="mt-3 text-xs text-rose-300" role="alert">{uploadError}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de validation */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            <div className="bg-[#0b1028] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-purple-500/15">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Images manquantes</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">L'enrichissement visuel est incomplet</p>
                </div>
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="ml-auto p-1.5 rounded-lg hover:bg-purple-500/10 text-slate-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Warnings */}
              <div className="p-5 space-y-2">
                {validationWarnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-yellow-400">!</span>
                    </div>
                    <p className="text-xs text-yellow-200 leading-relaxed">{warning}</p>
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-purple-500/10">
                  Souhaitez-vous ajouter les images manquantes ou continuer malgré tout vers WordPress ?
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#070d22] border border-purple-500/25 text-slate-300 hover:text-white hover:border-purple-500/50 text-sm font-medium transition-all"
                >
                  Retour — ajouter les images
                </button>
                <button
                  onClick={() => { setShowValidationModal(false); onPublish(); }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
                >
                  Continuer quand même →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
