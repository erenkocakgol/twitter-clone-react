import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Search, Send, ArrowLeft, MessageCircle, Check, CheckCheck, MoreVertical, Trash2, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { messagesAPI, usersAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/common/Avatar'
import Spinner from '../components/common/Spinner'
import { formatRelativeTime } from '../utils/helpers'

export default function Messages() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()
  const toast = useToast()
  
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [showMenu, setShowMenu] = useState(null) // conversation id for menu
  const [hidingConversation, setHidingConversation] = useState(null)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Redirect guests
  useEffect(() => {
    if (isGuest) {
      navigate('/login')
    }
  }, [isGuest, navigate])

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  // Load conversation when ID changes
  useEffect(() => {
    if (conversationId && user) {
      loadMessages(conversationId)
      setShowMobileChat(true)
    }
  }, [conversationId, user])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.conversations()
      setConversations(response.data.data || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (convId) => {
    try {
      const response = await messagesAPI.messages(convId)
      setMessages(response.data.data.messages || [])
      setActiveConversation(response.data.data.conversation)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return
    
    setSending(true)
    try {
      const response = await messagesAPI.send(
        activeConversation.other_user_id,
        newMessage.trim()
      )
      setMessages(prev => [...prev, response.data.data])
      setNewMessage('')
      inputRef.current?.focus()
      
      // Update conversation list
      loadConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error(error.message || 'Mesaj gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    setSearching(true)
    try {
      const response = await usersAPI.search(query)
      setSearchResults(response.data.data || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const startConversation = async (username) => {
    try {
      const response = await messagesAPI.startConversation(username)
      const conv = response.data.data
      navigate(`/messages/${conv.id}`)
      setSearchQuery('')
      setSearchResults([])
      loadConversations()
    } catch (error) {
      console.error('Failed to start conversation:', error)
      toast.error(error.message || 'Sohbet başlatılamadı')
    }
  }

  const selectConversation = (conv) => {
    navigate(`/messages/${conv.id}`)
  }

  const handleHideConversation = async (convId) => {
    setHidingConversation(convId)
    try {
      await messagesAPI.hideConversation(convId)
      setConversations(prev => prev.filter(c => c.id !== convId))
      
      // If hiding active conversation, clear it
      if (activeConversation?.id === convId) {
        setActiveConversation(null)
        setMessages([])
        navigate('/messages')
      }
      
      toast.success('Sohbet gizlendi')
    } catch (error) {
      toast.error(error.message || 'Sohbet gizlenemedi')
    } finally {
      setHidingConversation(null)
      setShowMenu(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex bg-white rounded-xl overflow-hidden border border-twitter-extraLightGray">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-twitter-extraLightGray flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Search Header */}
        <div className="p-4 border-b border-twitter-extraLightGray">
          <h2 className="text-xl font-bold text-twitter-black mb-3">Mesajlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-twitter-lightGray" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-twitter-extraLightGray rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-twitter-blue"
            />
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-2 w-[calc(100%-32px)] bg-white rounded-xl shadow-lg border border-twitter-extraLightGray max-h-60 overflow-y-auto">
              {searchResults.map(u => (
                <button
                  key={u.id}
                  onClick={() => startConversation(u.username)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-twitter-extraLightGray transition-colors"
                >
                  <Avatar src={u.avatar} alt={u.name} size="sm" />
                  <div className="text-left">
                    <p className="font-medium text-twitter-black">{u.name}</p>
                    <p className="text-sm text-twitter-lightGray">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-16 h-16 text-twitter-extraLightGray mb-4" />
              <h3 className="text-lg font-medium text-twitter-darkGray mb-2">Henüz mesaj yok</h3>
              <p className="text-sm text-twitter-lightGray">Yukarıdan kullanıcı arayarak sohbet başlatın</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`relative group flex items-center gap-3 p-4 hover:bg-twitter-extraLightGray transition-colors border-b border-twitter-extraLightGray ${
                  activeConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <button
                  onClick={() => selectConversation(conv)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Avatar src={conv.other_avatar} alt={conv.other_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-twitter-black truncate">{conv.other_name}</p>
                      {conv.last_message_at && (
                        <span className="text-xs text-twitter-lightGray">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-twitter-lightGray truncate">
                        {conv.last_message_sender_id == user?.id ? 'Sen: ' : ''}
                        {conv.last_message || 'Sohbet başlatıldı'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-twitter-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Conversation Menu */}
                <div className="relative" ref={showMenu === conv.id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(showMenu === conv.id ? null : conv.id)
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-twitter-darkGray" />
                  </button>
                  
                  {showMenu === conv.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-twitter-extraLightGray z-20 min-w-[160px] py-1">
                      <Link
                        to={`/profile/${conv.other_username}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-twitter-extraLightGray transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profili Görüntüle
                      </Link>
                      <button
                        onClick={() => handleHideConversation(conv.id)}
                        disabled={hidingConversation === conv.id}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        {hidingConversation === conv.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Sohbeti Gizle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-twitter-extraLightGray bg-white">
              <button 
                onClick={() => {
                  setShowMobileChat(false)
                  navigate('/messages')
                }}
                className="md:hidden p-2 hover:bg-twitter-extraLightGray rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link 
                to={`/profile/${activeConversation.other_username}`}
                className="flex items-center gap-3 flex-1 hover:bg-twitter-extraLightGray/50 rounded-lg p-1 -m-1 transition-colors"
              >
                <Avatar src={activeConversation.other_avatar} alt={activeConversation.other_name} size="md" />
                <div>
                  <p className="font-bold text-twitter-black">{activeConversation.other_name}</p>
                  <p className="text-sm text-twitter-lightGray">@{activeConversation.other_username}</p>
                </div>
              </Link>
              
              {/* Header Menu */}
              <div className="relative" ref={showMenu === 'header' ? menuRef : null}>
                <button
                  onClick={() => setShowMenu(showMenu === 'header' ? null : 'header')}
                  className="p-2 hover:bg-twitter-extraLightGray rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-twitter-darkGray" />
                </button>
                
                {showMenu === 'header' && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-twitter-extraLightGray z-20 min-w-[160px] py-1">
                    <Link
                      to={`/profile/${activeConversation.other_username}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-twitter-extraLightGray transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profili Görüntüle
                    </Link>
                    <button
                      onClick={() => handleHideConversation(activeConversation.id)}
                      disabled={hidingConversation === activeConversation.id}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {hidingConversation === activeConversation.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Sohbeti Gizle
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, index) => {
                const isOwn = msg.sender_id == user?.id
                const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== msg.sender_id)
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && showAvatar && (
                      <Avatar src={msg.sender_avatar} alt={msg.sender_name} size="xs" />
                    )}
                    {!isOwn && !showAvatar && <div className="w-6" />}
                    
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isOwn 
                          ? 'bg-twitter-blue text-white rounded-br-md' 
                          : 'bg-white text-twitter-black rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-twitter-lightGray'}`}>
                        <span className="text-xs">{formatRelativeTime(msg.created_at)}</span>
                        {isOwn && (
                          msg.is_read 
                            ? <CheckCheck className="w-4 h-4" /> 
                            : <Check className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-twitter-extraLightGray bg-white">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesaj yaz..."
                  className="flex-1 px-4 py-3 bg-twitter-extraLightGray rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-twitter-blue text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50">
            <MessageCircle className="w-20 h-20 text-twitter-extraLightGray mb-4" />
            <h3 className="text-xl font-bold text-twitter-black mb-2">Mesajlarınız</h3>
            <p className="text-twitter-lightGray max-w-xs">
              Bir sohbet seçin veya yeni bir konuşma başlatmak için kullanıcı arayın
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
