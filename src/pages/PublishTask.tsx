import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const PublishTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    typeLabel: 'TAREA',
    location: 'Remoto',
    price: '',
    tag: 'General'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert([
        {
          title: formData.title,
          description: formData.description,
          type_label: formData.typeLabel,
          location: formData.location,
          price: formData.price,
          tag: formData.tag,
          creator_id: user.id
        }
      ]);

      if (error) throw error;
      
      alert('Tarea publicada exitosamente');
      navigate('/');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Publicar una tarea nueva</h1>
      <p className="text-sm text-gray-500 mb-8">Describe lo que necesitas y cuánto estás dispuesto a pagar.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título de la tarea</label>
          <input 
            type="text" 
            name="title"
            required
            placeholder="Ej. Maqueta de célula animal"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción detallada</label>
          <textarea 
            name="description"
            required
            rows={4}
            placeholder="Explica qué necesitas exactamente, materiales preferidos, fecha límite, etc."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de trabajo</label>
            <select 
              name="typeLabel"
              value={formData.typeLabel}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            >
              <option value="MAQUETA">Maqueta</option>
              <option value="ESCRITURA">Escritura / Resumen</option>
              <option value="TUTORÍA">Tutoría</option>
              <option value="PROYECTO">Proyecto</option>
              <option value="TAREA">Tarea en General</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría / Etiqueta</label>
            <input 
              type="text" 
              name="tag"
              placeholder="Ej. Matemáticas, Historia..."
              value={formData.tag}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
            <select 
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            >
              <option value="Remoto">Remoto</option>
              <option value="Presencial">Presencial</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ofrecido</label>
            <input 
              type="text" 
              name="price"
              required
              placeholder="Ej. $150 MXN"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-8"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar Tarea'}
        </button>
      </form>
    </div>
  );
};
