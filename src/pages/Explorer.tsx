import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Bookmark, Filter, Loader2, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

export const Explorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    fetchTasks();
  }, [searchParams]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      const q = searchParams.get('q');
      const cat = searchParams.get('category');

      if (q) {
        query = query.ilike('title', `%${q}%`);
      }
      if (cat && cat !== 'all') {
        // Tag based on categories
        query = query.ilike('type_label', `%${cat}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'beca', label: 'Becas' },
    { id: 'proyecto', label: 'Proyectos' },
    { id: 'tarea', label: 'Tareas' },
    { id: 'maqueta', label: 'Maquetas' },
    { id: 'escritura', label: 'Escritura' },
    { id: 'tutoría', label: 'Tutorías' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set('q', searchTerm);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleCategory = (cat: string) => {
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setCategory(cat);
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Explorar Oportunidades</h1>
          <p className="text-gray-500">Encuentra oportunidades para ayudar y ganar dinero</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Buscar por palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
          <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto">
            Buscar
          </button>
        </form>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                category === cat.id || (!searchParams.get('category') && cat.id === 'all')
                  ? "bg-brand-sidebar text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <Link to={`/task/${task.id}`} key={task.id} className="block group">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full group-hover:shadow-md group-hover:border-brand-primary/30 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  {task.profiles?.avatar_url ? (
                    <img src={task.profiles.avatar_url} alt="avatar" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-purple-600">
                      {task.profiles?.full_name ? task.profiles.full_name.charAt(0) : 'E'}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        {task.type_label}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {task.tag || 'General'}
                      </span>
                      {task.status === 'assigned' && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          No disponible
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 leading-tight truncate group-hover:text-brand-primary transition-colors">{task.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{task.profiles?.full_name || 'Estudiante'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {task.location}</div>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <div className="flex items-center gap-1 font-semibold text-brand-primary"><Briefcase className="w-3.5 h-3.5" /> {task.price}</div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 text-xs">
                  <div className="flex gap-2">
                    {/* Tag moved to top */}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No se encontraron oportunidades</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            No hay oportunidades publicadas que coincidan con tu búsqueda en este momento.
          </p>
          <button 
            onClick={() => {
              searchParams.delete('q');
              searchParams.delete('category');
              setSearchParams(searchParams);
              setSearchTerm('');
              setCategory('all');
            }}
            className="mt-6 text-brand-primary font-medium hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
