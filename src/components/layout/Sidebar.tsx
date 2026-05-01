import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Search, Briefcase, ClipboardList, 
  Bookmark, HelpCircle, Headphones,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: Search, label: 'Explorar tareas', path: '/explorer' },
  { icon: Briefcase, label: 'Mis Tareas', path: '/tasks' },
  { icon: ClipboardList, label: 'Mis postulaciones', path: '/applications' },
  { icon: Bookmark, label: 'Guardados', path: '/saved' },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-sidebar text-white flex flex-col p-4 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="bg-brand-primary p-1.5 rounded-lg flex items-center justify-center shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19L11 5H18L11 19H4Z" fill="white"/>
            <path d="M20 19L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Next<span className="text-brand-primary">Step</span></h1>
          <p className="text-xs text-gray-400">Tu ayuda académica</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
        
        <div className="pt-4 mt-4 border-t border-white/10">
           <NavLink
            to="/publish"
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/5",
                isActive && "bg-white/5 text-white"
              )
            }
          >
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Publicar tarea
            </div>
            <span className="bg-brand-primary text-[10px] px-2 py-0.5 rounded-full text-white font-bold tracking-wide">Nuevo</span>
          </NavLink>
           <NavLink
            to="/resources"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/5",
                isActive && "bg-white/5 text-white"
              )
            }
          >
            <HelpCircle className="w-5 h-5" />
            Consejos y recursos
          </NavLink>
        </div>
      </nav>

      {/* Post action card */}
      <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-brand-primary/20 w-8 h-8 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-brand-primary" />
          </div>
          <h3 className="text-sm font-bold leading-tight">¿Necesitas ayuda?</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Publica maquetas, resúmenes o proyectos y conecta con estudiantes.
        </p>
        <NavLink 
          to="/publish"
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Publicar ahora
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavLink>
      </div>

      {/* Help section */}
      <div className="mt-6 flex items-center gap-3 px-2 text-sm text-gray-400">
        <Headphones className="w-5 h-5" />
        <div>
          <p className="font-medium text-white">Soporte</p>
          <a href="mailto:soporte@schooltasker.com" className="text-brand-primary text-xs hover:underline">soporte@schooltasker.com</a>
        </div>
      </div>
    </aside>
  );
};
