import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, MAX_IMAGES_PER_POST } from '../../utils/constants'
import { formatFileSize } from '../../utils/helpers'

export default function ImageUpload({
  images = [],
  onChange,
  maxImages = MAX_IMAGES_PER_POST,
  type = 'post',
  single = false,
  className = ''
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useToast()

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const validateFile = (file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Geçersiz dosya türü. JPG, PNG, GIF veya WEBP yükleyin.')
      return false
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Dosya çok büyük. Maksimum ${formatFileSize(MAX_IMAGE_SIZE)}`)
      return false
    }
    return true
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validFiles = files.filter(validateFile)
    if (validFiles.length === 0) return

    // Check max images limit
    const remainingSlots = single ? 1 : maxImages - images.length
    if (validFiles.length > remainingSlots) {
      toast.warning(`En fazla ${maxImages} resim yükleyebilirsiniz.`)
    }

    const filesToUpload = validFiles.slice(0, remainingSlots)
    
    setUploading(true)
    
    try {
      const uploadPromises = filesToUpload.map(file => uploadAPI.image(file, type))
      const results = await Promise.all(uploadPromises)
      
      const newImages = results.map(res => res.data.data.url)
      
      if (single) {
        onChange(newImages[0])
      } else {
        onChange([...images, ...newImages])
      }
      
      toast.success('Resim(ler) yüklendi!')
    } catch (error) {
      toast.error(error.message || 'Resim yüklenemedi')
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index) => {
    if (single) {
      onChange(null)
    } else {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    }
  }

  const canAddMore = single ? !images : images.length < maxImages

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple={!single}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview images */}
      {!single && images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Yüklenen ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-twitter-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Single image preview */}
      {single && images && (
        <div className="relative inline-block mb-3">
          <img
            src={images}
            alt="Yüklenen"
            className="max-w-full h-auto max-h-64 rounded-lg"
          />
          <button
            type="button"
            onClick={() => removeImage(0)}
            className="absolute top-2 right-2 p-1 bg-twitter-black/70 text-white rounded-full hover:bg-twitter-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {canAddMore && (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-twitter-lightGray rounded-lg text-twitter-darkGray hover:border-twitter-blue hover:text-twitter-blue transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Yükleniyor...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              <span>
                {single ? 'Resim Yükle' : `Resim Ekle (${images.length}/${maxImages})`}
              </span>
            </>
          )}
        </button>
      )}

      {!single && (
        <p className="text-xs text-twitter-lightGray mt-1">
          JPG, PNG, GIF veya WEBP. Maks {formatFileSize(MAX_IMAGE_SIZE)}/dosya
        </p>
      )}
    </div>
  )
}
