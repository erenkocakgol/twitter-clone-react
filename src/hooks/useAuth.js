// Artık hook'u doğrudan context dosyasından alıyoruz.
// Bu, "Circular Dependency" ve "Multiple Context Instance" hatalarını önler.
export { useAuth } from '../context/AuthContext'