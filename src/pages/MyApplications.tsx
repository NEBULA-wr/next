import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          tasks (*, profiles:creator_id (full_name, avatar_url))
        `)
        .eq('applicant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mis Postulaciones</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map(app => (
            <Link to={`/task/${app.task_id}`} key={app.id} className="block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       {app.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-bold rounded-full">Pendiente</span>}
                       {app.status === 'accepted' && <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold rounded-full">Aceptado</span>}
                       {app.status === 'rejected' && <span className="bg-red-100 text-red-700 px-3 py-1 text-xs font-bold rounded-full">Rechazado</span>}
                       <span className="text-xs text-gray-500">Postulado {formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: es })}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors flex items-center gap-2">
                      {app.tasks.title}
                      {app.tasks.status === 'assigned' && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold tracking-wider uppercase">
                          No disponible
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.tasks.location}</span>
                      <span className="flex items-center gap-1 text-brand-primary font-semibold"><Briefcase className="w-4 h-4" /> {app.tasks.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    Por: {app.tasks.profiles?.full_name}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
          <p className="text-gray-500 mb-4">No te has postulado a ninguna tarea aún.</p>
          <Link to="/explorer" className="text-brand-primary font-medium hover:underline">Explorar tareas disponibles</Link>
        </div>
      )}
    </div>
  );
};
