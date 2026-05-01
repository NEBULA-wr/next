import React from 'react';
import { Bookmark, Clock } from 'lucide-react';

// For demonstration, a static page as Saved tasks would require a separate table
export const SavedTasks = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tareas Guardadas</h1>
      
      <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Próximamente</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          La funcionalidad para guardar tareas estará disponible en la próxima actualización. 
        </p>
      </div>
    </div>
  );
};
