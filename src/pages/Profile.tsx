import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Camera, CheckCircle, XCircle } from 'lucide-react';

export const Profile = () => {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('3ro');
  const [section, setSection] = useState('A');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      if (authProfile) {
        setProfile(authProfile);
        setFullName(authProfile.full_name || '');
        setAvatarUrl(authProfile.avatar_url || '');
        setPhone(authProfile.phone || '');
        if (authProfile.course) setCourse(authProfile.course);
        if (authProfile.section) setSection(authProfile.section);
      } else {
        fetchProfile();
      }
    }
  }, [user, authProfile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url || '');
      setPhone(data.phone || '');
      if (data.course) setCourse(data.course);
      if (data.section) setSection(data.section);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          phone,
          course,
          section
        })
        .eq('id', user?.id);

      // Si hay error porque Supabase no ha actualizado su caché (Column not found)
      if (error && error.message.includes("Could not find the 'course' column")) {
        console.warn("Schema cache error, retrying with basic fields...");
        const fallbackUpdate = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            avatar_url: avatarUrl
          })
          .eq('id', user?.id);
        
        error = fallbackUpdate.error;
        if (!error) {
          showToast('Perfil actualizado, pero debes ir a Supabase SQL editor y correr "NOTIFY pgrst, reload_schema;" para que guarden "curso" y "sección".', 'success');
          await refreshProfile();
          setLoading(false);
          return;
        }
      }

      if (error) throw error;
      
      await refreshProfile();
      showToast('Perfil actualizado correctamente', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Assuming "avatars" bucket is created as per instructions
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Error al subir la imagen. Verifica que el bucket "avatars" exista en Supabase de forma pública.');
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 relative">
      {toast && (
        <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in fade-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
          {toast.message}
        </div>
      )}
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
      
      <form onSubmit={updateProfile} className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                <Camera className="w-8 h-8" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-brand-primary text-white p-2 text-xs rounded-full cursor-pointer hover:bg-brand-primary-hover transition-colors shadow-md">
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={uploadAvatar} 
                disabled={uploading}
                className="hidden" 
              />
            </label>
          </div>
          {uploading && <p className="text-sm text-brand-primary mt-3 font-medium flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Subiendo imagen...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input 
            type="text" 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">El correo no puede ser modificado.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input 
            type="text" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
            >
              <option value="3ro">3ro</option>
              <option value="4to">4to</option>
              <option value="5to">5to</option>
              <option value="6to">6to</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
            <select
              value={section}
              onChange={e => setSection(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || uploading}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};
