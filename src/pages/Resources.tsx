import React from 'react';
import { HelpCircle, BookOpen, ShieldCheck, Mail } from 'lucide-react';

export const Resources = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Consejos y Recursos</h1>
      <p className="text-gray-500 mb-8">Mejora tu experiencia en NextStep con nuestras guías de seguridad y eficacia.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Seguridad ante todo</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Si decides reunirte de manera presencial para entregar una maqueta o recibir una tutoría, hazlo siempre en un lugar público y de día, como la biblioteca de la escuela o una cafetería concurrente.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-500 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Cómo poner un buen precio</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Evalúa el tiempo que te tomará hacer el proyecto y el costo de los materiales (si los hay). Un precio justo atrae a más estudiantes dispuestos a ayudarte.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-500 mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Claridad en tu publicación</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Entre más específica sea tu descripción, mejor. Indica fecha límite, formato requerido y cualquier detalle esencial. Esto evitará malentendidos y trabajos rehechos.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">¿Problemas? Contáctanos</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Si tuviste un problema con un pago o con la entrega de un proyecto, nuestro equipo de soporte está para ayudarte. Envíanos un correo a soporte@schooltasker.com.
          </p>
        </div>
      </div>
    </div>
  );
};
