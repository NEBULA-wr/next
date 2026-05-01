import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, MapPin, Clock, Briefcase, ChevronLeft, Calendar, User, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

export const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) fetchTaskDetails();
  }, [id, user]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      // Fetch task + creator profile
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:creator_id (full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // Check if user has applied
      if (user && taskData.creator_id !== user.id) {
        const { data: myApp } = await supabase
          .from('applications')
          .select('*')
          .eq('task_id', id)
          .eq('applicant_id', user.id)
          .single();
        
        if (myApp) setHasApplied(true);
      }

      // If user is creator, fetch all applications
      if (user && taskData.creator_id === user.id) {
        const { data: appsData } = await supabase
          .from('applications')
          .select(`
            *,
            profiles:applicant_id (full_name, avatar_url, phone, course, section)
          `)
          .eq('task_id', id);
        
        if (appsData) setApplications(appsData);
      }

    } catch (err: any) {
      console.error('Error fetching task details:', err);
      showToast('Error cargando la tarea: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          task_id: id,
          applicant_id: user.id
        });

      if (error) throw error;
      
      // CREATE NOTIFICATION FOR CREATOR
      if (user && task.creator_id) {
        // We know task.creator_id exists because user is applying
        // We also can get user's name from user object or profile, but we will pass a generic one just in case
        await supabase.from('notifications').insert({
          user_id: task.creator_id,
          title: 'Nueva postulación',
          message: `Un estudiante se ha postulado a tu tarea "${task.title}".`,
          link: `/task/${id}`
        });
      }

      setHasApplied(true);
      showToast('Postulación enviada exitosamente.', 'success');
    } catch (err: any) {
      showToast('Error al postularte: ' + err.message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showToast('Tarea eliminada exitosamente', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message, 'error');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, applicantId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appId);

      if (error) throw error;
      
      if (status === 'accepted') {
        const { error: taskError } = await supabase.from('tasks').update({ status: 'assigned' }).eq('id', id);
        if (taskError) throw taskError;
        
        // Rechazar a todos los demás localmente para actualizar UI
        await supabase.from('applications').update({ status: 'rejected' }).eq('task_id', id).neq('id', appId);
        
        setApplications(prev => prev.map(a => {
          if (a.id === appId) return { ...a, status: 'accepted' };
          return { ...a, status: 'rejected' };
        }));
        setTask(prev => prev ? { ...prev, status: 'assigned' } : null);
      } else {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      }

      // INSERT NOTIFICATION
      await supabase.from('notifications').insert({
        user_id: applicantId,
        title: status === 'accepted' ? '¡Postulación Aceptada!' : 'Postulación Rechazada',
        message: `Tu postulación para la tarea "${task?.title}" ha sido ${status === 'accepted' ? 'aceptada' : 'rechazada'}.`,
        link: `/task/${id}`
      });

      // Re-fetch
      fetchTaskDetails();
      showToast('Estado actualizado', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  if (!task) {
    return <div className="text-center py-20">Tarea no encontrada</div>;
  }

  const isCreator = user?.id === task.creator_id;

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {toast && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in fade-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
          {toast.message}
        </div>
      )}
      
      <Link to={-1 as any} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-purple-50 text-purple-600 px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full">
                {task.type_label}
              </span>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full">
                {task.tag || 'General'}
              </span>
              {task.status === 'assigned' && (
                <span className="bg-green-50 text-green-600 px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full">
                  Asignada / Cerrada
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
              )}
              {isCreator && (
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {confirmDelete ? '¿Estás seguro?' : 'Eliminar publicación'}
                </button>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
          <p className="text-lg text-gray-600 mb-8 whitespace-pre-wrap">{task.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 text-sm">
            <div>
              <p className="text-gray-500 flex items-center gap-1 mb-1"><MapPin className="w-4 h-4" /> Modalidad</p>
              <p className="font-semibold text-gray-900">{task.location}</p>
            </div>
            <div>
              <p className="text-gray-500 flex items-center gap-1 mb-1"><Briefcase className="w-4 h-4" /> Paga</p>
              <p className="font-semibold text-brand-primary text-lg">{task.price}</p>
            </div>
            <div>
              <p className="text-gray-500 flex items-center gap-1 mb-1"><Calendar className="w-4 h-4" /> Publicado</p>
              <p className="font-semibold text-gray-900">{format(new Date(task.created_at), "dd MMM yyyy", { locale: es })}</p>
            </div>
            <div>
              <p className="text-gray-500 flex items-center gap-1 mb-1"><User className="w-4 h-4" /> Categoría</p>
              <p className="font-semibold text-gray-900">{task.tag || 'General'}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {task.profiles?.avatar_url ? (
               <img src={task.profiles.avatar_url} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
             ) : (
               <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold bg-purple-600">
                 {task.profiles?.full_name ? task.profiles.full_name.charAt(0) : 'E'}
               </div>
             )}
            <div>
              <p className="text-sm text-gray-500">Publicado por</p>
              <p className="font-bold text-gray-900">{task.profiles?.full_name || 'Estudiante Anónimo'}</p>
            </div>
          </div>

          {!isCreator && task.status !== 'assigned' && (
            <button 
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={cn(
                "px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                hasApplied 
                  ? "bg-green-100 text-green-700 cursor-default" 
                  : "bg-brand-primary hover:bg-brand-primary-hover text-white disabled:opacity-70"
              )}
            >
              {applying && <Loader2 className="w-5 h-5 animate-spin" />}
              {hasApplied ? '¡Postulación Enviada!' : 'Postularme ahora'}
            </button>
          )}
          {!isCreator && task.status === 'assigned' && (
            <button 
              disabled
              className="px-8 py-3 rounded-xl font-medium flex items-center gap-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              Tarea ya asignada
            </button>
          )}
        </div>
      </div>

      {isCreator && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Postulantes ({applications.length})</h2>
          
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">Aún no hay estudiantes postulados a esta tarea.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {app.profiles?.avatar_url ? (
                      <img src={app.profiles.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold bg-blue-600">
                        {app.profiles?.full_name ? app.profiles.full_name.charAt(0) : 'E'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{app.profiles?.full_name}</p>
                      <p className="text-sm text-gray-500">Postulado el {format(new Date(app.created_at), "dd MMM, HH:mm")}</p>
                      {app.status === 'accepted' && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p><span className="font-semibold text-gray-900">Teléfono:</span> {app.profiles?.phone || 'No especificado'}</p>
                          <p><span className="font-semibold text-gray-900">Curso:</span> {app.profiles?.course || '?'} - Sección {app.profiles?.section || '?'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateApplicantStatus(app.id, app.applicant_id, 'rejected')}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Rechazar
                        </button>
                        <button 
                          onClick={() => handleUpdateApplicantStatus(app.id, app.applicant_id, 'accepted')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Aceptar
                        </button>
                      </>
                    )}
                    {app.status === 'accepted' && (
                      <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">Aceptado</span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold">Rechazado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
