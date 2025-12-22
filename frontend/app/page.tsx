"use client";

import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] transition-colors duration-300">
      {/* Header con Theme Toggle */}
      <header className="bg-[rgb(var(--sidebar))] border-b border-[rgb(var(--border))] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
              PaciGest Plus
            </h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Bienvenida */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              ¡Sistema de Temas + Modo Oscuro Funcionando! 🎨🌓
            </h2>
            <p className="text-lg text-[rgb(var(--gray-medium))]">
              Prueba los 3 temas y el modo oscuro/claro usando los botones en el header
            </p>
          </div>

          {/* Cards de demostración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl">
                  💙
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  Tema Soft
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Colores pasteles suaves y profesionales
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl">
                  🔵
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  Tema Corporate
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Azul corporativo tradicional y confiable
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl">
                  💚
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  Tema Medical
                </h3>
              </div>
              <p className="text-[rgb(var(--gray-medium))]">
                Verde médico, fresco y saludable
              </p>
            </div>
          </div>

          {/* Botones de ejemplo */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-all font-medium shadow-md hover:shadow-lg">
              Botón Primario
            </button>
            <button className="px-6 py-3 bg-[rgb(var(--success))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg">
              Botón Éxito
            </button>
            <button className="px-6 py-3 bg-[rgb(var(--warning))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg">
              Botón Advertencia
            </button>
            <button className="px-6 py-3 bg-[rgb(var(--error))] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg">
              Botón Error
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-[rgb(var(--accent)/0.2)] rounded-lg p-6 border border-[rgb(var(--accent))] transition-colors">
            <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
              💡 Características del Sistema de Temas
            </h4>
            <ul className="space-y-2 text-[rgb(var(--gray-medium))]">
              <li>✅ 3 temas pre-configurados (Soft, Corporate, Medical)</li>
              <li>✅ Modo claro y oscuro para cada tema (6 combinaciones)</li>
              <li>✅ Cambio instantáneo sin recargar página</li>
              <li>✅ Preferencias guardadas en localStorage</li>
              <li>✅ Colores centralizados en variables CSS</li>
              <li>✅ Transiciones suaves entre temas/modos</li>
            </ul>
          </div>

          {/* Grid de prueba de colores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[rgb(var(--pastel-blue))] text-[rgb(var(--foreground))] text-center font-medium">
              Pastel Blue
            </div>
            <div className="p-4 rounded-lg bg-[rgb(var(--pastel-lavender))] text-[rgb(var(--foreground))] text-center font-medium">
              Lavender
            </div>
            <div className="p-4 rounded-lg bg-[rgb(var(--pastel-pink))] text-[rgb(var(--foreground))] text-center font-medium">
              Pink
            </div>
            <div className="p-4 rounded-lg bg-[rgb(var(--pastel-yellow))] text-[rgb(var(--foreground))] text-center font-medium">
              Yellow
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}