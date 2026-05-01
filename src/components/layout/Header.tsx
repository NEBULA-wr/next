import React, { useEffect, useState } from 'react';
import { Search, Bell, ChevronDown, User as UserIcon, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const Header = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if(!user) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if(data) setNotifications(data);
    } catch(err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markAsRead = async (id: string, link: string | null) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (link) {
        setShowNotifications(false);
        navigate(link);
      }
    } catch (err) {}
  };

  const deleteAllNotifications = async () => {
    if(!user) return;
    try {
      await supabase.from('notifications').delete().eq('user_id', user.id);
      setNotifications([]);
    } catch(err) {
      console.error("Error deleting all notifications", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(search.trim()) {
      navigate(`/explorer?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="h-20 bg-brand-bg px-8 flex items-center justify-between z-50 sticky top-0">
      <div className="flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative">
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary">
            <Search className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca tareas, maquetas o palabras clave..." 
            className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm shadow-sm"
          />
        </form>
      </div>

      <div className="flex items-center gap-6 ml-4 relative">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-brand-primary transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-brand-primary border-2 border-white rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Notificaciones</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => fetchNotifications()} className="text-[11px] text-gray-500 hover:text-brand-primary">Actualizar</button>
                  {notifications.length > 0 && (
                    <button onClick={deleteAllNotifications} className="text-[11px] text-red-500 hover:text-red-600">Borrar todas</button>
                  )}
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-6">No tienes notificaciones</p>
                ) : (
                  notifications.map(notif => (
                    <button 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id, notif.link)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.is_read ? 'bg-purple-50/30' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                          <p className={`text-xs mt-1 ${!notif.is_read ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}</p>
                        </div>
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-brand-primary mt-1"></span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
          className="flex items-center gap-3 hover:bg-gray-100 p-1.5 rounded-full pr-4 transition-colors"
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url}
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white">
              <UserIcon className="w-5 h-5" />
            </div>
          )}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {profile?.full_name || user?.user_metadata?.full_name || 'Estudiante'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role || 'Estudiante'}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
            <Link 
              to="/profile" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setShowDropdown(false)}
            >
              Mi Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
