import { useState } from 'react'
import { X, Hash } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Input from '../common/Input'
import ImageUpload from '../common/ImageUpload'
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_TAGS } from '../../utils/constants'
import { parseTags } from '../../utils/helpers'

export default function PostForm({ onSubmit, onCancel, initialData = null }) {
  const { user } = useAuth()
  const [title, setTitle] = useState(initialData?.title || '')
  // "description" yerine "content" kullanıyoruz çünkü backend muhtemelen bu ismi bekliyor
  const [content, setContent] = useState(initialData?.content || initialData?.description || '')
  const [images, setImages] = useState(initialData?.images || [])
  const [tagInput, setTagInput] = useState(initialData?.tags?.join(', ') || '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    
    if (!title.trim()) {
      newErrors.title = 'Başlık gerekli'
    } else if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Başlık en fazla ${MAX_TITLE_LENGTH} karakter olabilir`
    }

    // Değişken adı content olarak güncellendi
    if (content.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.content = `Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    
    try {
      const tags = parseTags(tagInput)
      
      await onSubmit({
        title: title.trim(),
        content: content.trim(), // Backend'e 'content' alanı gönderiliyor
        images,
        tags
      })

      // Formu sıfırla
      setTitle('')
      setContent('')
      setImages([])
      setTagInput('')
      setErrors({})
    } catch (error) {
      // Hata üst bileşende yakalanıyor
      console.error("Form submit hatası:", error);
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-twitter-extraLightGray">
      <div className="flex gap-3">
        <Avatar src={user.avatar} name={user.name} size="md" />
        
        <div className="flex-1 space-y-3">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık (zorunlu)"
              className="w-full text-xl font-bold placeholder-twitter-lightGray focus:outline-none bg-transparent"
              maxLength={MAX_TITLE_LENGTH}
            />
            {errors.title && (
              <p className="text-sm text-accent-heart mt-1">{errors.title}</p>
            )}
            <div className="text-xs text-twitter-lightGray text-right">
              {title.length}/{MAX_TITLE_LENGTH}
            </div>
          </div>

          {/* Content (Eski adıyla Description) */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Neler düşünüyorsun?"
              className="w-full resize-none placeholder-twitter-lightGray focus:outline-none bg-transparent min-h-[80px]"
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
            />
            {errors.content && (
              <p className="text-sm text-accent-heart mt-1">{errors.content}</p>
            )}
            <div className="text-xs text-twitter-lightGray text-right">
              {content.length}/{MAX_DESCRIPTION_LENGTH}
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            images={images}
            onChange={setImages}
            type="post"
          />

          {/* Tags */}
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-twitter-lightGray" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Etiketler (virgülle ayırın)"
              className="flex-1 text-sm placeholder-twitter-lightGray focus:outline-none bg-transparent"
            />
          </div>
          <p className="text-xs text-twitter-lightGray">
            En fazla {MAX_TAGS} etiket ekleyebilirsiniz
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-twitter-extraLightGray">
            <div className="text-sm text-twitter-darkGray">
              {images.length > 0 && `${images.length} resim`}
            </div>
            
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                >
                  İptal
                </Button>
              )}
              <Button
                type="submit"
                loading={loading}
                disabled={!title.trim()}
              >
                Paylaş
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}