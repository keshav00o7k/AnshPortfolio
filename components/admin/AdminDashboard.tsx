"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminVideoItem, ProjectCategory } from "@/types";

const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
  { value: "reel", label: "Reel / Short" },
  { value: "youtube", label: "YouTube Video" },
  { value: "ad", label: "Commercial / Ad" },
  { value: "wedding", label: "Wedding Film" },
  { value: "film", label: "Short Film" },
  { value: "event", label: "Event Recap" },
];

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [assets, setAssets] = useState<AdminVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentXhrRef = useRef<XMLHttpRequest | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<ProjectCategory>("reel");
  const [editOrder, setEditOrder] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Publish toggle state tracking
  const [updatingPublishId, setUpdatingPublishId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminVideoItem | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Auto-dismiss feedback notice after 6 seconds
  useEffect(() => {
    if (feedbackNotice) {
      const timer = setTimeout(() => setFeedbackNotice(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedbackNotice]);

  // Fetch all assets from /api/admin/list
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setListError("");
    try {
      const res = await fetch("/api/admin/list", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error(`Failed to load assets (Status ${res.status})`);
      }
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Error loading portfolio assets.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/list", { headers: { "Cache-Control": "no-cache" } })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/admin/login");
            return null;
          }
          throw new Error(`Failed to load assets (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!ignore && data?.assets) {
          setAssets(data.assets);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setListError(err instanceof Error ? err.message : "Error loading portfolio assets.");
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [router]);

  // Cancel ongoing upload
  const handleCancelUpload = () => {
    if (currentXhrRef.current) {
      currentXhrRef.current.abort();
      currentXhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatusText("");
    setUploadError("Upload was cancelled.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Perform Direct Browser-to-Cloudinary Upload
  const handleFileSelect = async (file: File) => {
    setUploadError("");
    setUploadSuccess("");

    // 1. Client-side format check
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["mp4", "mov", "webm", "m4v"];
    if (!extension || !allowedExtensions.includes(extension)) {
      setUploadError(
        `Invalid file format (.${extension || "unknown"}). Allowed formats: mp4, mov, webm.`
      );
      return;
    }

    // 2. Client-side size check (100 MB max)
    const MAX_BYTES = 100 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setUploadError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 100 MB limit. Please select a smaller video.`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText("Requesting signed upload authorization...");

    try {
      // Step A: Request server signature
      const signRes = await fetch("/api/admin/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!signRes.ok) {
        const signData = await signRes.json().catch(() => ({}));
        throw new Error(signData.error || `Signing failed with status ${signRes.status}`);
      }

      const signData = await signRes.json();
      const { signature, timestamp, api_key, cloud_name, public_id, asset_folder } = signData;

      // Step B: Direct XHR POST to Cloudinary
      setUploadStatusText("Uploading directly to Cloudinary...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("public_id", public_id);
      formData.append("asset_folder", asset_folder);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        currentXhrRef.current = xhr;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
            setUploadStatusText(`Uploading to Cloudinary: ${percent}%`);
          }
        };

        xhr.onload = () => {
          currentXhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let errorMsg = `Cloudinary returned HTTP ${xhr.status}`;
            try {
              const resJson = JSON.parse(xhr.responseText);
              if (resJson.error?.message) errorMsg = resJson.error.message;
            } catch {}
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          currentXhrRef.current = null;
          reject(new Error("Network error during direct Cloudinary upload."));
        };

        xhr.onabort = () => {
          currentXhrRef.current = null;
          reject(new Error("Upload aborted."));
        };

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`);
        xhr.send(formData);
      });

      // Step C: Server post-upload verification through Admin API
      setUploadStatusText("Verifying upload integrity with server...");

      const verifyRes = await fetch("/api/admin/verify-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id }),
      });

      if (!verifyRes.ok) {
        const verifyData = await verifyRes.json().catch(() => ({}));
        throw new Error(verifyData.error || "Server verification failed.");
      }

      setUploadSuccess(`Successfully uploaded ${public_id} as a draft!`);
      setUploadStatusText("");
      setIsUploading(false);
      setUploadProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh listing
      await fetchAssets();
    } catch (err) {
      setIsUploading(false);
      setUploadStatusText("");
      setUploadProgress(0);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 1. Instant Publish / Hide Toggle with optimistic update
  const handleTogglePublish = async (asset: AdminVideoItem) => {
    const nextState = !asset.isPublished;
    setUpdatingPublishId(asset.publicId);

    // Optimistic UI update
    setAssets((prev) =>
      prev.map((item) =>
        item.publicId === asset.publicId ? { ...item, isPublished: nextState } : item
      )
    );

    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: asset.publicId,
          published: nextState,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update status (${res.status})`);
      }

      setFeedbackNotice(
        nextState
          ? `✓ Published "${asset.title}". Live homepage will update within 2–8 seconds after Search API indexing.`
          : `✓ Hidden "${asset.title}". It is now removed from the public homepage.`
      );
    } catch (err) {
      // Revert optimistic update
      setAssets((prev) =>
        prev.map((item) =>
          item.publicId === asset.publicId ? { ...item, isPublished: asset.isPublished } : item
        )
      );
      alert(`Error updating publish state: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUpdatingPublishId(null);
    }
  };

  // 2. Open inline edit mode
  const handleStartEdit = (asset: AdminVideoItem) => {
    setEditingId(asset.publicId);
    setEditTitle(asset.title || "");
    setEditCategory(asset.category || "reel");
    setEditOrder(asset.order ?? 0);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  // 3. Save inline edits
  const handleSaveEdit = async (publicId: string) => {
    setIsSavingEdit(true);
    setEditError("");

    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          title: editTitle,
          category: editCategory,
          order: editOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to save changes (${res.status})`);
      }

      // Update local asset
      setAssets((prev) =>
        prev.map((item) =>
          item.publicId === publicId
            ? {
                ...item,
                title: editTitle.replace(/[|=]/g, "").trim().slice(0, 80),
                category: editCategory,
                order: Math.min(Math.max(editOrder, 0), 9999),
              }
            : item
        )
      );

      setEditingId(null);
      setFeedbackNotice("✓ Metadata updated successfully.");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save edits.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 4. Delete Flow with Two-step modal and Hide recommendation
  const handleOpenDelete = (asset: AdminVideoItem) => {
    setDeleteTarget(asset);
    setDeleteStep(1);
    setDeleteError("");
  };

  const handleCloseDelete = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteStep(1);
    setDeleteError("");
  };

  const handleHideInsteadOfDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: deleteTarget.publicId,
          published: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to hide video.");
      }

      setAssets((prev) =>
        prev.map((item) =>
          item.publicId === deleteTarget.publicId ? { ...item, isPublished: false } : item
        )
      );
      setDeleteTarget(null);
      setFeedbackNotice(`✓ Video "${deleteTarget.title}" hidden and kept safely in storage.`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error hiding video.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: deleteTarget.publicId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete video.");
      }

      // Remove from local assets
      setAssets((prev) => prev.filter((item) => item.publicId !== deleteTarget.publicId));
      setDeleteTarget(null);
      setFeedbackNotice(`✓ Permanently deleted ${deleteTarget.publicId} from Cloudinary.`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const publishedCount = assets.filter((a) => a.isPublished).length;
  const draftCount = assets.filter((a) => !a.isPublished).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet">
            <span className="h-2 w-2 rounded-full bg-violet animate-pulse" />
            Admin Console (Stage 4)
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Portfolio Video Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-bg"
          >
            View Live Site ↗
          </Link>
          <form action="/api/admin/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-line bg-surface px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Persistent Security & Hide Notice Banner */}
      <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-xs text-mute flex items-start gap-3 shadow-xs">
        <span className="text-violet text-base leading-none">ℹ️</span>
        <div>
          <strong className="text-ink font-semibold">Live Site Visibility & CDN Behavior:</strong>
          <p className="mt-0.5 leading-relaxed">
            Hiding an asset removes it from the public homepage and portfolio galleries. However,
            as with standard content delivery networks, direct video URLs remain reachable by
            anyone who already has the link until permanently deleted.
          </p>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackNotice && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-sm flex items-center justify-between transition-all">
          <span>{feedbackNotice}</span>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Box Section */}
      <section className="mt-8">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Direct Cloudinary Upload
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-mute">
                Uploads direct from browser to Cloudinary via server signature. Max file size: 100 MB. New uploads default to Unpublished (Draft).
              </p>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
            className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? "border-violet bg-violet/5"
                : "border-line/80 bg-bg hover:border-violet/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              disabled={isUploading}
            />

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet/10 text-violet">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <p className="mt-3 text-sm font-medium text-ink">
              Drag and drop video here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-violet underline hover:text-plum font-semibold focus:outline-none"
              >
                browse file
              </button>
            </p>
            <p className="mt-1 text-xs text-mute">MP4, MOV, or WEBM up to 100 MB</p>
          </div>

          {/* Upload Progress & Controls */}
          {isUploading && (
            <div className="mt-5 rounded-xl border border-line/60 bg-bg p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-ink">
                <span>{uploadStatusText}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-line overflow-hidden">
                <div
                  className="h-full bg-violet transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {uploadError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
              {uploadSuccess}
            </div>
          )}
        </div>
      </section>

      {/* Asset Catalog Listing */}
      <section className="mt-8">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Portfolio Assets ({assets.length})
            </h2>
            <p className="text-xs text-mute">
              Published on live site: <span className="font-semibold text-emerald-700">{publishedCount}</span> | Drafts (Hidden):{" "}
              <span className="font-semibold text-violet">{draftCount}</span>
            </p>
          </div>
          <button
            onClick={fetchAssets}
            disabled={isLoading}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-bg transition-colors"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh List"}
          </button>
        </div>

        {listError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            {listError}
          </div>
        )}

        {/* Assets Grid */}
        {isLoading && assets.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-12 text-center text-sm text-mute">
            Loading assets from Cloudinary...
          </div>
        ) : assets.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-12 text-center text-sm text-mute">
            No assets found in AnshPortfolio folder. Upload your first video above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => {
              const sizeMB = (asset.bytes / (1024 * 1024)).toFixed(1);
              const formattedDate = new Date(asset.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const isEditing = editingId === asset.publicId;
              const isTogglingPublish = updatingPublishId === asset.publicId;

              return (
                <div
                  key={asset.publicId}
                  className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm flex flex-col transition-all hover:border-violet/40"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                    {asset.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.posterUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-mute">
                        No poster frame
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {asset.isPublished ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-950/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-500/40 shadow-xs">
                          ● Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-purple-950/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-purple-200 border border-purple-500/40 shadow-xs">
                          ○ Draft (Hidden)
                        </span>
                      )}
                    </div>

                    {/* Quick Category & Order Tag */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white uppercase tracking-wider">
                        {asset.category}
                      </span>
                      <span className="rounded bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-mono text-purple-200">
                        #{asset.order ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 text-xs">
                    {isEditing ? (
                      /* Inline Edit Form */
                      <div className="flex flex-col gap-2.5">
                        <div>
                          <div className="flex justify-between items-center text-[10px] text-mute mb-1">
                            <label className="font-semibold text-ink">Title</label>
                            <span>{editTitle.length}/80</span>
                          </div>
                          <input
                            type="text"
                            maxLength={80}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Video Title"
                            className="w-full rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-violet focus:outline-none"
                            disabled={isSavingEdit}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-ink block mb-1">
                              Category
                            </label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as ProjectCategory)}
                              className="w-full rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-violet focus:outline-none"
                              disabled={isSavingEdit}
                            >
                              {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-ink block mb-1">
                              Order (0-9999)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={9999}
                              value={editOrder}
                              onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                              className="w-full rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-violet focus:outline-none"
                              disabled={isSavingEdit}
                            />
                          </div>
                        </div>

                        {editError && (
                          <p className="text-[11px] text-red-600 font-medium">{editError}</p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(asset.publicId)}
                            disabled={isSavingEdit}
                            className="flex-1 rounded-md bg-violet px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet/90 transition-colors disabled:opacity-50"
                          >
                            {isSavingEdit ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSavingEdit}
                            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-bg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Static Details Display */
                      <div>
                        <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-1" title={asset.title}>
                          {asset.title || asset.publicId}
                        </h3>
                        <p className="font-mono text-[10px] text-mute truncate mt-0.5" title={asset.publicId}>
                          {asset.publicId}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-mute text-[11px]">
                          <span>{sizeMB} MB</span>
                          <span className="uppercase">{asset.format}</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    {!isEditing && (
                      <div className="pt-2 border-t border-line/60 flex flex-col gap-2">
                        {/* Publish / Hide Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(asset)}
                          disabled={isTogglingPublish}
                          className={`w-full rounded-md py-1.5 px-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                            asset.isPublished
                              ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {isTogglingPublish ? (
                            "Updating..."
                          ) : asset.isPublished ? (
                            <>
                              <span>Hide from Live Site</span>
                            </>
                          ) : (
                            <>
                              <span>✓ Publish to Live Site</span>
                            </>
                          )}
                        </button>

                        {/* Secondary Actions: Edit, Preview, Delete */}
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(asset)}
                            className="font-semibold text-violet hover:text-plum transition-colors"
                          >
                            ✎ Edit Details
                          </button>

                          <a
                            href={asset.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mute hover:text-ink transition-colors"
                          >
                            Preview ↗
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(asset)}
                            className="font-semibold text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Two-Step Delete Confirmation Modal with "Hide First" Recommendation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {deleteStep === 1 ? (
              /* Step 1: Recommendation to Hide */
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>

                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  Remove Video from Portfolio?
                </h3>
                <p className="mt-1 text-xs text-mute">
                  Target asset: <code className="font-mono text-ink font-semibold">{deleteTarget.publicId}</code>
                </p>

                {/* Primary Recommendation Card */}
                <div className="mt-4 rounded-xl border border-violet/20 bg-violet/5 p-4 text-xs leading-relaxed text-ink">
                  <strong className="text-violet block mb-1">
                    💡 Recommended: Hide Video Instead
                  </strong>
                  If you just want to remove this reel from your public website, click{" "}
                  <strong>Hide Video Instead</strong>. It will remain securely stored as a draft in your
                  Cloudinary account, allowing you to republish it whenever you wish.
                </div>

                {deleteError && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleHideInsteadOfDelete}
                    disabled={isDeleting}
                    className="w-full rounded-lg bg-violet py-2.5 px-4 text-xs font-semibold text-white hover:bg-violet/90 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Hiding video..." : "✓ Hide Video Instead (Recommended)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    disabled={isDeleting}
                    className="w-full rounded-lg border border-red-200 bg-red-50 py-2.5 px-4 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    I understand, proceed to permanent deletion →
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseDelete}
                    disabled={isDeleting}
                    className="w-full rounded-lg border border-line bg-surface py-2 px-4 text-xs font-semibold text-mute hover:bg-bg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Irreversible Deletion Confirmation */
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>

                <h3 className="mt-3 font-display text-lg font-bold text-red-700">
                  Permanent Storage Deletion
                </h3>
                <p className="mt-1 text-xs text-mute leading-relaxed">
                  Are you absolutely certain? This will{" "}
                  <strong className="text-red-700">permanently erase</strong> the video file{" "}
                  <code className="font-mono text-ink font-semibold">{deleteTarget.publicId}</code> from your
                  Cloudinary storage bucket. This action cannot be reversed.
                </p>

                {deleteError && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleConfirmPermanentDelete}
                    disabled={isDeleting}
                    className="w-full rounded-lg bg-red-600 py-2.5 px-4 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting from Cloudinary..." : "Yes, Permanently Delete Asset"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    disabled={isDeleting}
                    className="w-full rounded-lg border border-line bg-surface py-2 px-4 text-xs font-semibold text-ink hover:bg-bg transition-colors"
                  >
                    ← Back to Safety
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
