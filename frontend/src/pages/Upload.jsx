import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, ImagePlus, Film, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const Upload = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setErrorMessage('');
    } else if (file) {
      setErrorMessage('Please select a valid video file.');
    }
    if (e.target) e.target.value = null;
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrorMessage('');
    } else if (file) {
      setErrorMessage('Please select a valid image file.');
    }
    if (e.target) e.target.value = null;
  };

  const removeVideoFile = () => {
    setVideoFile(null);
  };

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const onSubmit = async (data) => {
    if (!videoFile) {
      setErrorMessage('Video file is required.');
      return;
    }
    if (!thumbnailFile) {
      setErrorMessage('Thumbnail image is required.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnailFile);
      formData.append('title', data.title);
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await api.post('/videos/publish', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data?.data?._id) {
        navigate(`/watch/${response.data.data._id}`);
      } else {
        throw new Error('Upload successful but video ID not returned.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Backend EBUSY error on Windows will catch here
      setErrorMessage(error.response?.data?.message || error.message || 'An error occurred during upload.');
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="font-['Outfit'] text-[28px] font-semibold text-[#F4F4F5] mb-2 leading-tight">
          Upload Video
        </h1>
        <p className="text-[#A1A1AA] text-sm">
          Share your content with the world
        </p>
      </div>

      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-10 backdrop-blur-[12px] shadow-2xl">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] backdrop-blur-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
            <p className="text-[#F87171] text-sm leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Video Upload Zone */}
          <div>
            {!videoFile ? (
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-[rgba(255,255,255,0.12)] rounded-[16px] py-[48px] px-[24px] text-center cursor-pointer transition-all duration-200 hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.04)] group"
              >
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  ref={videoInputRef}
                  onChange={handleVideoFileChange}
                />
                <div className="flex justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
                  <UploadIcon className="w-12 h-12 text-[#52525B]" />
                </div>
                <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">Drop your video here</p>
                <p className="text-[#52525B] text-[13px]">or click to browse · MP4, MOV, AVI</p>
              </div>
            ) : (
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg bg-[rgba(99,102,241,0.1)] flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#F4F4F5] text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-[#A1A1AA] text-xs font-mono">{formatFileSize(videoFile.size)}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={removeVideoFile}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[rgba(255,255,255,0.06)] transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Upload Zone */}
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-2 font-medium">Thumbnail *</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={thumbnailInputRef}
              onChange={handleThumbnailFileChange}
            />
            {!thumbnailPreview ? (
              <div 
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-[rgba(255,255,255,0.12)] rounded-[16px] py-8 px-6 text-center cursor-pointer transition-all duration-200 hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.04)] group"
              >
                <div className="flex justify-center mb-3 transition-transform duration-200 group-hover:scale-110">
                  <ImagePlus className="w-8 h-8 text-[#52525B]" />
                </div>
                <p className="text-[#A1A1AA] text-[14px] font-medium">Upload thumbnail</p>
              </div>
            ) : (
              <div className="relative group rounded-[12px] overflow-hidden bg-black/50 aspect-video w-full max-h-[180px] border border-[rgba(255,255,255,0.08)]">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <span className="text-white text-sm font-medium bg-[rgba(255,255,255,0.1)] px-5 py-2 rounded-full backdrop-blur-md border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.2)] transition-all">
                    Change
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-2 font-medium">Title *</label>
            <input 
              type="text"
              placeholder="Give your video a title"
              {...register('title', { required: 'Title is required' })}
              className={`w-full bg-[rgba(255,255,255,0.05)] border ${errors.title ? 'border-[#F87171]' : 'border-[rgba(255,255,255,0.08)] focus:border-[#6366F1]'} rounded-[10px] text-[#F4F4F5] px-4 py-3 text-sm outline-none transition-all placeholder:text-[#52525B] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)]`}
            />
            {errors.title && <p className="text-[#F87171] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.title.message}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-[#A1A1AA] text-[13px] mb-2 font-medium">Description</label>
            <textarea 
              rows={4}
              placeholder="Tell viewers about your video"
              {...register('description')}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] focus:border-[#6366F1] focus:ring-[3px] focus:ring-[rgba(99,102,241,0.15)] rounded-[10px] text-[#F4F4F5] px-4 py-3 text-sm outline-none transition-all placeholder:text-[#52525B] resize-y min-h-[100px]"
            ></textarea>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3 pt-2">
              <div className="w-full bg-[rgba(255,255,255,0.06)] rounded-full h-[6px] overflow-hidden">
                <div 
                  className="bg-[#6366F1] h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[#A1A1AA] text-[13px] text-right font-mono">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full py-[12px] px-5 text-[14px] font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              'Publish Video'
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Upload;
