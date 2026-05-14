import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Eye, 
  EyeOff, 
  Pencil, 
  Trash2, 
  VideoOff, 
  Plus, 
  ImagePlus, 
  Loader2,
  X 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  
  // Loading states for actions
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingIds, setPublishingIds] = useState(new Set());

  const fetchMyVideos = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/videos/my-videos');
      setVideos(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const handleTogglePublish = async (videoId) => {
    setPublishingIds(prev => new Set(prev).add(videoId));
    try {
      // Optimistic update
      setVideos(prev => prev.map(v => 
        v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
      ));
      
      const res = await api.patch(`/videos/${videoId}/toggle-publish`);
      
      // Sync with server
      setVideos(prev => prev.map(v => 
        v._id === videoId ? { ...v, isPublished: res.data.data.isPublished } : v
      ));
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      // Revert on error
      setVideos(prev => prev.map(v => 
        v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
      ));
    } finally {
      setPublishingIds(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/videos/${videoToDelete._id}`);
      setVideos(prev => prev.filter(v => v._id !== videoToDelete._id));
      setVideoToDelete(null);
    } catch (error) {
      console.error('Failed to delete video:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-8 pb-20 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Outfit'] text-[28px] font-semibold text-[#F4F4F5] mb-1">
            My Videos
          </h1>
          <p className="text-[#A1A1AA] text-[14px]">
            {!isLoading ? `${videos.length} videos` : 'Loading...'}
          </p>
        </div>
        <Link 
          to="/upload"
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full py-[10px] px-5 text-[14px] font-medium transition-all duration-200 flex items-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New</span>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-[16px] p-4 flex gap-4 h-[122px] animate-pulse">
              <div className="w-[160px] h-[90px] rounded-[10px] bg-[rgba(255,255,255,0.05)] shrink-0"></div>
              <div className="flex-1 py-1">
                <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[24px] backdrop-blur-sm">
          <VideoOff className="w-12 h-12 text-[#52525B] mb-4" />
          <h2 className="text-[#F4F4F5] text-lg font-medium mb-2">No videos yet</h2>
          <p className="text-[#A1A1AA] text-sm mb-6 max-w-sm">
            Upload your first video to start building your channel and sharing your content with the world.
          </p>
          <Link 
            to="/upload"
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full py-2.5 px-6 text-[14px] font-medium transition-all"
          >
            Upload your first video
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {videos.map(video => (
            <div 
              key={video._id}
              className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 flex gap-4 mb-[12px] transition-all hover:bg-[rgba(255,255,255,0.05)] backdrop-blur-md group"
            >
              {/* Left: Thumbnail */}
              <div className="w-[160px] h-[90px] shrink-0 rounded-[10px] overflow-hidden border border-[rgba(255,255,255,0.06)]">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Middle: Info */}
              <div className="flex-1 min-w-0 flex flex-col py-0.5">
                <h3 className="text-[#F4F4F5] text-[15px] font-medium truncate" title={video.title}>
                  {video.title}
                </h3>
                <p className="text-[#A1A1AA] text-[13px] line-clamp-2 mt-1 leading-snug font-['Inter']">
                  {video.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="flex items-center text-[#52525B] text-[12px] font-mono">
                    <span>{formatViews(video.views)} views</span>
                    <span className="mx-1.5">·</span>
                    <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                  </div>
                  
                  <span className={`px-[10px] py-[2px] rounded-full text-[11px] font-medium border font-mono ${
                    video.isPublished 
                      ? 'bg-[rgba(52,211,153,0.1)] text-[#34D399] border-[rgba(52,211,153,0.2)]'
                      : 'bg-[rgba(161,161,170,0.1)] text-[#A1A1AA] border-[rgba(161,161,170,0.2)]'
                  }`}>
                    {video.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="shrink-0 flex flex-col items-stretch gap-2">
                <button
                  onClick={() => handleTogglePublish(video._id)}
                  disabled={publishingIds.has(video._id)}
                  className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                    video.isPublished
                      ? 'bg-transparent text-[#F87171] border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.1)]'
                      : 'bg-transparent text-[#34D399] border-[rgba(52,211,153,0.2)] hover:bg-[rgba(52,211,153,0.1)]'
                  }`}
                >
                  {publishingIds.has(video._id) ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  ) : video.isPublished ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                  {video.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setVideoToEdit(video)}
                    className="flex-1 flex items-center justify-center h-8 rounded-full bg-transparent border border-[rgba(255,255,255,0.1)] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                    title="Edit video"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setVideoToDelete(video)}
                    className="flex-1 flex items-center justify-center h-8 rounded-full bg-transparent border border-[rgba(255,255,255,0.1)] text-[#A1A1AA] hover:text-[#F87171] hover:border-[rgba(248,113,113,0.3)] hover:bg-[rgba(248,113,113,0.1)] transition-all"
                    title="Delete video"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {videoToEdit && (
        <EditVideoModal 
          video={videoToEdit} 
          onClose={() => setVideoToEdit(null)}
          onSuccess={(updatedVideo) => {
            setVideos(prev => prev.map(v => v._id === updatedVideo._id ? updatedVideo : v));
            setVideoToEdit(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[rgba(15,15,15,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 max-w-[360px] w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-['Outfit'] text-[20px] font-semibold text-[#F4F4F5] mb-2">Delete Video</h3>
            <p className="text-[#A1A1AA] text-[14px] mb-6 leading-relaxed">
              Delete <span className="text-[#F4F4F5] font-medium">"{videoToDelete.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setVideoToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full text-[14px] font-medium text-[#F4F4F5] bg-transparent border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full text-[14px] font-medium text-[#F87171] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.2)] transition-colors flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Modal Component
const EditVideoModal = ({ video, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: video.title,
      description: video.description
    }
  });
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(video.thumbnail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (thumbnailFile && thumbnailPreview && thumbnailPreview !== video.thumbnail) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailFile, thumbnailPreview, video.thumbnail]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
    if (e.target) e.target.value = null;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || "");
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const res = await api.patch(`/videos/${video._id}`, formData);
      onSuccess(res.data.data);
    } catch (error) {
      console.error('Failed to update video:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to update video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-[rgba(12,12,12,0.98)] backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] rounded-[20px] p-8 max-w-[480px] w-full shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="font-['Outfit'] text-[20px] font-semibold text-[#F4F4F5] mb-6">Edit Video</h2>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] text-[#F87171] text-[13px] backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Thumbnail Preview/Change */}
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-2 font-medium">Thumbnail</label>
            <div className="relative group rounded-[12px] overflow-hidden bg-black/50 aspect-video w-full border border-[rgba(255,255,255,0.08)]">
              <img 
                src={thumbnailPreview} 
                alt="Thumbnail preview" 
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-white text-sm font-medium bg-[rgba(255,255,255,0.1)] px-5 py-2 rounded-full backdrop-blur-md border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.2)] transition-all">
                  Change Image
                </span>
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleThumbnailChange}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-2 font-medium">Title</label>
            <input 
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`w-full bg-[rgba(255,255,255,0.05)] border ${errors.title ? 'border-[#F87171]' : 'border-[rgba(255,255,255,0.08)] focus:border-[#6366F1]'} rounded-[10px] text-[#F4F4F5] px-4 py-2.5 text-sm outline-none transition-all placeholder:text-[#52525B] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)]`}
            />
            {errors.title && <p className="text-[#F87171] text-xs mt-2">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-2 font-medium">Description</label>
            <textarea 
              rows={4}
              {...register('description')}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] focus:border-[#6366F1] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)] rounded-[10px] text-[#F4F4F5] px-4 py-2.5 text-sm outline-none transition-all placeholder:text-[#52525B] resize-y min-h-[100px]"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-[14px] font-medium text-[#F4F4F5] bg-transparent border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-[14px] font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition-all disabled:opacity-70 flex items-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.25)]"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default MyVideos;
