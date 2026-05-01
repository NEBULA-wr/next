import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const PublishTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    typeLabel: searchParams.get('type') || 'TAREA',
    location: 'Remoto',
    price: '',
    tag: 'General'
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      setFormData(prev => ({ ...prev, typeLabel: type.toUpperCase() }));
    }
  }, [searchParams]);

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

      const isBeca = formData.typeLabel === 'BECA';
      const isProyecto = formData.typeLabel === 'PROYECTO';

      const getTitlePlaceholder = () => {
        if (isBeca) return "Ej. Beca de excelencia académica (Santander)";
        if (isProyecto) return "Ej. Desarrollo de aplicación web, Proyecto de investigación...";
        return "Ej. Resolución de guía de matemáticas, Ensayo...";
      };

      const getDescriptionPlaceholder = () => {
        if (isBeca) return "Describe la institución, requisitos, cobertura de la beca, fechas importantes...";
        if (isProyecto) return "Describe los objetivos del proyecto, roles buscados, duración y conocimientos requeridos...";
        return "Explica qué necesitas exactamente, fecha límite, formato de entrega, etc.";
      };

      const getPriceLabel = () => {
        if (isBeca) return "Monto de la beca";
        if (isProyecto) return "Presupuesto del proyecto";
        return "Pago ofrecido";
      };

      const getPricePlaceholder = () => {
        if (isBeca) return "Ej. Mensualidad o monto total";
        if (isProyecto) return "Ej. $500 - $1000";
        return "Ej. $30.00";
      };

      const getCategoryLabel = () => {
        if (isBeca) return "Área de estudio / Facultad";
        if (isProyecto) return "Habilidades o tecnologías (Ej. React, Excel)";
        return "Categoría / Etiqueta";
      };

      const getCategoryPlaceholder = () => {
        if (isBeca) return "Ej. Ingeniería, Medicina, General...";
        if (isProyecto) return "Ej. Diseño gráfico, Programación...";
        return "Ej. Matemáticas, Historia...";
      };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isBeca ? 'Publicar una Beca' : 
         isProyecto ? 'Publicar un Proyecto' : 
         'Publicar una Tarea'}
      </h1>
      <p className="text-sm text-gray-500 mb-8">Describe los detalles de tu publicación.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input 
            type="text" 
            name="title"
            required
            placeholder={getTitlePlaceholder()}
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
            placeholder={getDescriptionPlaceholder()}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isBeca ? "Tipo de oportunidad" : "Tipo de trabajo"}
            </label>
            <select 
              name="typeLabel"
              value={formData.typeLabel}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            >
              <option value="TAREA">Tarea en General</option>
              <option value="BECA">Beca</option>
              <option value="PROYECTO">Proyecto</option>
              <option value="MAQUETA">Maqueta</option>
              <option value="ESCRITURA">Escritura / Resumen</option>
              <option value="TUTORÍA">Tutoría</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getCategoryLabel()}</label>
            <input 
              type="text" 
              name="tag"
              placeholder={getCategoryPlaceholder()}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{getPriceLabel()}</label>
            <input 
              type="text" 
              name="price"
              required
              placeholder={getPricePlaceholder()}
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar'}
        </button>
      </form>
    </div>
  );
};
