import React, { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, MapPin, Clock, Briefcase, Users, LayoutDashboard, Rss, Search, Plus, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Subcomponents ---

const ImpactCard = () => {
  const [stats, setStats] = useState({ tasks: 0, students: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: tasksCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
      const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      // Temporary simple completion mock based on 'status' if we wanted, or just static.
      const { count: completedCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      
      setStats({
        tasks: tasksCount || 0,
        students: studentsCount || 0,
        completed: completedCount || 0
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-[#0f1225] rounded-2xl p-6 text-white text-sm">
      <h3 className="text-lg font-bold mb-1">Impacto SchoolTasker</h3>
      <p className="text-gray-400 mb-6">Crecemos juntos cada día</p>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2.5 rounded-lg"><Briefcase className="w-5 h-5 text-blue-400" /></div>
          <div>
            <p className="text-lg font-bold">{stats.tasks}</p>
            <p className="text-gray-400 text-xs">Tareas publicadas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2.5 rounded-lg"><Users className="w-5 h-5 text-purple-400" /></div>
          <div>
            <p className="text-lg font-bold">{stats.students}</p>
            <p className="text-gray-400 text-xs">Estudiantes conectados</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2.5 rounded-lg"><LayoutDashboard className="w-5 h-5 text-gray-400" /></div>
          <div>
            <p className="text-lg font-bold">{stats.completed}</p>
            <p className="text-gray-400 text-xs">Tareas completadas</p>
          </div>
        </div>
      </div>
      
      <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mt-8 transition-colors">
        Ver impacto completo <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

const HowItWorks = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-bold mb-6 text-gray-900">¿Cómo funciona?</h3>
    
    <div className="relative pl-8 space-y-8">
      {/* Line connecting steps */}
      <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-gray-100"></div>
      
      <div className="relative">
        <div className="absolute -left-8 top-0.5 w-6 h-6 bg-brand-sidebar text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">1</div>
        <h4 className="font-semibold text-sm text-gray-900">Explora ofertas</h4>
        <p className="text-xs text-gray-500 mt-1">Encuentra la tarea ideal para ti.</p>
      </div>
      
      <div className="relative">
        <div className="absolute -left-8 top-0.5 w-6 h-6 bg-brand-sidebar text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">2</div>
        <h4 className="font-semibold text-sm text-gray-900">Postúlate o Acepta</h4>
        <p className="text-xs text-gray-500 mt-1">Contacta al estudiante o envía tu precio.</p>
      </div>
      
      <div className="relative">
        <div className="absolute -left-8 top-0.5 w-6 h-6 bg-brand-sidebar text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">3</div>
        <h4 className="font-semibold text-sm text-gray-900">Realiza y gana</h4>
        <p className="text-xs text-gray-500 mt-1">Completa el trabajo y recibe tu pago.</p>
      </div>
    </div>
    
    <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-brand-primary font-medium hover:text-brand-primary-hover mt-8 transition-colors">
      Conoce más del proceso <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
);

const JobCard = ({ task }: { task: any; key?: React.Key }) => {
  const profile = task.profiles;
  const color = "bg-purple-600"; // Can be dynamic based on type

  return (
    <Link to={`/task/${task.id}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group block">
      <div className="flex items-start gap-4 mb-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0", color)}>
            {profile?.full_name ? profile.full_name.charAt(0) : 'E'}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={cn("text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold tracking-wider uppercase")}>
              {task.type_label}
            </span>
            <span className={cn("text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold tracking-wider uppercase")}>
              {task.tag || 'General'}
            </span>
            {task.status === 'assigned' && (
              <span className={cn("text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold tracking-wider uppercase")}>
                No disponible
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 leading-tight truncate group-hover:text-brand-primary transition-colors">{task.title}</h3>
          <p className="text-sm text-gray-500 truncate">{profile?.full_name || 'Estudiante'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {task.location}</div>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-brand-primary"><Briefcase className="w-3.5 h-3.5" /> {task.price}</div>
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
          <button className="text-gray-400 hover:text-gray-900 transition-colors" onClick={(e) => { e.preventDefault(); /* handle save */ }}>
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Main Page ---

export const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex xl:flex-row flex-col gap-6">
      {/* Left Column (Main Content) */}
      <div className="flex-1 space-y-8 max-w-5xl">
        
        {/* Hero */}
        <div className="relative">
          <p className="text-sm font-semibold tracking-wider text-brand-primary uppercase mb-2">Bienvenido a SchoolTasker</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Conectamos estudiantes<br />con <span className="text-brand-primary">soluciones rápidas</span>
          </h1>
          <p className="text-gray-600 max-w-xl text-sm sm:text-base mb-10 leading-relaxed">
            Plataforma de conexión académica. Encuentra ayuda para tus maquetas, resúmenes o proyectos, o gana dinero ayudando a otros.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <button 
              onClick={() => navigate('/explorer')}
              className="flex-1 bg-brand-sidebar hover:bg-[#1a1e36] text-white rounded-2xl p-6 text-left transition-all group shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/10 p-2 rounded-full"><Search className="w-5 h-5" /></div>
                  <span className="text-xs font-bold tracking-wider text-gray-300">QUIERO TRABAJAR</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Buscar tareas</h3>
                <p className="text-sm text-gray-400">Explora trabajos escolares que puedes realizar por un pago.</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </button>
            
            <button 
              onClick={() => navigate('/publish')}
              className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl p-6 text-left transition-all group shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-brand-primary/10 p-2 rounded-full"><Plus className="w-5 h-5 text-brand-primary" /></div>
                  <span className="text-xs font-bold tracking-wider text-brand-primary">NECESITO AYUDA</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Publicar tarea</h3>
                <p className="text-sm text-gray-500">Sube lo que necesitas y un compañero lo hará por ti.</p>
              </div>
              <ArrowRight className="w-6 h-6 text-brand-primary transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
          {/* Decorative image placeholder to match the reference */}
          <div className="hidden lg:block absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent -z-10 pointer-events-none translate-x-20 -translate-y-10 rounded-full blur-3xl opacity-60"></div>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" alt="Students studying" className="hidden lg:block absolute right-0 top-0 w-80 h-72 object-cover rounded-[2rem] shadow-xl mask-image-circle z-0 border-8 border-white object-top" style={{ clipPath: 'circle(50% at 50% 50%)' }} />
        </div>

        {/* Featured Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tareas recientes</h2>
            <Link to="/explorer" className="flex items-center gap-2 text-sm text-brand-primary font-medium hover:text-brand-primary-hover">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">Cargando tareas...</div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <JobCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-xl">
              <p className="text-gray-500 mb-4">Aún no hay tareas publicadas.</p>
              <Link to="/publish" className="text-brand-primary hover:underline">¡Sé el primero en pedir ayuda!</Link>
            </div>
          )}
        </div>

        {/* Explore Categories */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Explora por categoría</h2>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
             {['Resúmenes', 'Maquetas', 'Tutorías', 'Ensayos', 'Diseño', 'Programación', 'Ver más'].map((cat, i) => (
                <Link 
                  key={i} 
                  to={cat === 'Ver más' ? '/explorer' : `/explorer?category=${encodeURIComponent(cat.substring(0, 7).toLowerCase())}`} 
                  className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:border-brand-primary/30 hover:shadow-sm cursor-pointer transition-all group"
                >
                   <div className={cn("p-2 rounded-lg bg-gray-50 group-hover:bg-brand-primary/10 transition-colors", i === 6 ? "bg-brand-bg": "")}>
                      {i === 0 ? <Rss className="w-6 h-6 text-blue-500" /> : 
                       i === 1 ? <Briefcase className="w-6 h-6 text-green-500" /> :
                       i === 2 ? <Users className="w-6 h-6 text-purple-500" /> :
                       i === 6 ? <LayoutDashboard className="w-6 h-6 text-gray-400" /> :
                       <Search className="w-6 h-6 text-gray-700" />}
                   </div>
                   <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 text-center">{cat}</span>
                </Link>
             ))}
          </div>
        </div>
      </div>

      {/* Right Column (Sidebar Extras) */}
      <div className="xl:w-80 flex flex-col gap-6 flex-shrink-0">
        <ImpactCard />
        <HowItWorks />
        
        {/* Ad/Promo card */}
        <div className="bg-gradient-to-br from-[#1a1c2d] to-[#2d1b54] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg border border-white/10">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Impulsa tu promedio</h3>
            <p className="text-sm text-gray-300 mb-6 max-w-[200px]">Accede a los mejores estudiantes para ayudarte a destacar en clase.</p>
            <Link to="/explorer?category=tutoría" className="inline-flex bg-[#4d289e] hover:bg-[#5b32bc] px-5 py-2.5 rounded-lg text-sm font-medium transition-colors items-center gap-2">
              Ver tutores <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Rocket emoji placeholder */}
          <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-80 transform -rotate-12">
            🚀
          </div>
        </div>
      </div>
    </div>
  );
};
