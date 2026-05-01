import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const fetchMyTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          applications(count)
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mis Tareas Publicadas</h1>
        <Link to="/publish" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Publicar Nueva Tarea
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map(task => (
            <Link to={`/task/${task.id}`} key={task.id} className="block group">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors flex items-center gap-2">
                      {task.title}
                      {task.status === 'assigned' && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold tracking-wider uppercase">
                          No disponible
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {task.location}</span>
                      <span className="flex items-center gap-1 font-semibold"><Briefcase className="w-4 h-4" /> {task.price}</span>
                      <span className="text-gray-400 block sm:inline">Publicado {formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: es })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-900">{task.applications[0]?.count || 0}</p>
                      <p className="text-xs text-gray-500">Postulantes</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
          <p className="text-gray-500 mb-4">No has publicado ninguna tarea aún.</p>
          <Link to="/publish" className="text-brand-primary font-medium hover:underline">Comenzar ahora</Link>
        </div>
      )}
    </div>
  );
};
