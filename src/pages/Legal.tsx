import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { Card, Chip } from '@/components/ui/Primitives'
import { PageHeader } from '@/components/shared'

const UPDATED = '13 de junio de 2026'

type Section = { id: string; title: string; body: ReactNode }

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-zinc-400">{children}</p>
}

function H({ children }: { children: ReactNode }) {
  return <h3 className="neon-title mt-5 text-lg text-zinc-200 first:mt-0">{children}</h3>
}

const SECTIONS: Section[] = [
  {
    id: 'terminos',
    title: 'Términos y Condiciones',
    body: (
      <>
        <P>
          Bienvenido a Juégatela. Al crear una cuenta o utilizar la plataforma aceptas estos Términos y
          Condiciones. Juégatela es, en su estado actual, un prototipo en modo seguro que funciona exclusivamente
          con fichas demo de carácter ficticio y sin valor económico real.
        </P>
        <H>1. Objeto del servicio</H>
        <P>
          Juégatela ofrece un entorno social para crear retos y porras entre amigos y participar en minijuegos. El
          servicio se presta tal cual, con fines de entretenimiento y demostración. No constituye una casa de
          apuestas ni un operador de juego con dinero real.
        </P>
        <H>2. Cuenta de usuario</H>
        <P>
          Eres responsable de la confidencialidad de tus credenciales y de toda la actividad realizada desde tu
          cuenta. Debes facilitar información veraz y mantenerla actualizada. Una sola persona puede titular una
          única cuenta.
        </P>
        <H>3. Conducta aceptable</H>
        <P>
          Te comprometes a no usar la plataforma para actividades ilícitas, fraude, acoso, suplantación de
          identidad o manipulación de resultados. Nos reservamos el derecho de suspender o cerrar cuentas que
          incumplan estas normas.
        </P>
        <H>4. Limitación de responsabilidad</H>
        <P>
          En la medida permitida por la ley, Juégatela no será responsable de daños indirectos derivados del uso
          del prototipo. Al tratarse de fichas demo, no existen pérdidas económicas reales.
        </P>
      </>
    ),
  },
  {
    id: 'privacidad',
    title: 'Política de Privacidad',
    body: (
      <>
        <P>
          Tu privacidad nos importa. Esta política explica qué datos tratamos y con qué finalidad dentro del
          prototipo de Juégatela.
        </P>
        <H>Datos que tratamos</H>
        <P>
          Recogemos los datos mínimos para que la demo funcione: alias, avatar y preferencias de la aplicación, que
          se guardan localmente en tu dispositivo. No solicitamos datos bancarios ni documentos de identidad,
          porque no se opera con dinero real.
        </P>
        <H>Finalidad</H>
        <P>
          Utilizamos estos datos para ofrecerte la experiencia, recordar tus ajustes y mostrarte tu actividad. No
          vendemos tus datos a terceros.
        </P>
        <H>Tus derechos</H>
        <P>
          Puedes acceder, rectificar o eliminar tus datos en cualquier momento desde Ajustes, incluido el reinicio
          completo de la demo. En una versión licenciada con dinero real, el tratamiento de datos se ampliaría para
          cumplir las obligaciones legales de verificación.
        </P>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Política de Cookies',
    body: (
      <>
        <P>
          Juégatela utiliza almacenamiento local y, en su caso, cookies estrictamente necesarias para recordar tu
          sesión y tus preferencias dentro del prototipo.
        </P>
        <H>Tipos de almacenamiento</H>
        <P>
          Usamos almacenamiento técnico para mantener tu saldo demo, retos y ajustes entre visitas. No empleamos
          cookies de publicidad ni de seguimiento de terceros en este prototipo.
        </P>
        <H>Gestión</H>
        <P>
          Puedes borrar este almacenamiento desde tu navegador o reiniciando la demo en Ajustes. Deshabilitar el
          almacenamiento técnico puede impedir que la aplicación recuerde tu progreso.
        </P>
      </>
    ),
  },
  {
    id: 'juego',
    title: 'Política de Juego y Reglas',
    body: (
      <>
        <P>
          Estas reglas rigen la creación y resolución de retos y porras dentro de Juégatela, siempre con fichas
          demo.
        </P>
        <H>Retos</H>
        <P>
          Al crear un reto se definen las posturas de cada parte, la apuesta en fichas, la fecha y el método de
          verificación. Al aceptarlo, ambas partes bloquean sus fichas. El ganador recibe el bote según el método
          acordado.
        </P>
        <H>Porras</H>
        <P>
          En una porra, cada participante paga una entrada y elige una opción. El bote se reparte entre quienes
          acierten. Si no hay aciertos o la porra se cancela, las entradas se reembolsan según sus reglas.
        </P>
        <H>Resolución y disputas</H>
        <P>
          La verificación puede ser automática, por consenso, por prueba, por votación o por revisión de un
          moderador. Si surge un desacuerdo, el saldo queda retenido hasta que se resuelva la disputa. Las
          decisiones de moderación buscan ser justas y proporcionadas.
        </P>
      </>
    ),
  },
  {
    id: 'reembolsos',
    title: 'Política de Reembolsos',
    body: (
      <>
        <P>
          Como Juégatela opera con fichas demo sin valor económico, no existen pagos ni reembolsos de dinero real.
        </P>
        <H>Reembolso de fichas demo</H>
        <P>
          Cuando un reto o porra se cancela, se anula o queda sin resolución válida, las fichas bloqueadas se
          devuelven a los participantes. Puedes consultar estos movimientos en tu historial de transacciones.
        </P>
        <H>Versión con dinero real</H>
        <P>
          En un hipotético despliegue con dinero real, los reembolsos se regirían por la normativa de juego
          aplicable y exigirían verificación de identidad y métodos de pago verificados. Nada de esto está activo en
          el prototipo.
        </P>
      </>
    ),
  },
  {
    id: 'aml',
    title: 'Prevención de Blanqueo de Capitales (AML)',
    body: (
      <>
        <P>
          La prevención del blanqueo de capitales es un pilar de cualquier operador de juego con dinero real. En el
          prototipo no se mueve dinero real, por lo que no se aplican controles financieros.
        </P>
        <H>Compromiso</H>
        <P>
          En una versión licenciada, Juégatela aplicaría medidas de diligencia debida: verificación de identidad
          (KYC), control de origen de fondos, límites de operación y comunicación de operaciones sospechosas a las
          autoridades competentes.
        </P>
        <H>Modo demo</H>
        <P>
          Mientras el servicio funcione con fichas ficticias, no se procesan transferencias, depósitos ni retiradas
          reales, y por tanto no existe riesgo de blanqueo asociado a la plataforma.
        </P>
      </>
    ),
  },
  {
    id: 'edad',
    title: 'Aviso de edad +18',
    body: (
      <>
        <P>
          El acceso a Juégatela está reservado a personas mayores de 18 años. Apostar y competir por fichas, aunque
          sean ficticias, es una actividad pensada para adultos.
        </P>
        <H>Verificación de edad</H>
        <P>
          En el prototipo confiamos en tu declaración de mayoría de edad. En un entorno con dinero real, la
          verificación de edad sería obligatoria y previa a cualquier operación.
        </P>
        <H>Juego responsable</H>
        <P>
          Si el juego deja de ser un entretenimiento, busca ayuda. Consulta nuestra sección de juego responsable
          para conocer límites, autoexclusión y recursos de apoyo.
        </P>
      </>
    ),
  },
]

export default function Legal() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="La letra pequeña, clara"
        title="Información legal"
        subtitle="Todo lo que rige Juégatela en un solo sitio. Recuerda: es un prototipo en modo seguro con fichas ficticias."
        action={<Chip tone="zinc">Actualizado: {UPDATED}</Chip>}
      />

      <Card glow="shadow-neon-purple/20" className="mb-6 flex items-start gap-3 border-neon-purple/30 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon-purple/15 text-neon-purple">
          <ShieldAlert size={18} />
        </div>
        <p className="text-sm text-zinc-300">
          Juégatela es un prototipo en modo seguro: se juega con fichas demo sin valor económico. Operar con dinero
          real requeriría las licencias correspondientes, verificación de identidad (KYC) y comprobación de edad.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Índice pegajoso */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="p-3">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Índice</div>
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Contenido */}
        <div className="space-y-5">
          {SECTIONS.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="scroll-mt-6"
            >
              <Card className="p-5 sm:p-6">
                <h2 className="neon-title mb-3 text-2xl text-zinc-100">{s.title}</h2>
                <div className="space-y-2">{s.body}</div>
              </Card>
            </motion.section>
          ))}
          <p className="px-1 text-[11px] text-zinc-500">
            Estos textos son contenido de demostración con fines ilustrativos y no constituyen asesoramiento legal.
          </p>
        </div>
      </div>
    </div>
  )
}
