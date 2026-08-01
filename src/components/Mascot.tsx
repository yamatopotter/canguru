import { cn } from '@/lib/utils';

interface MascotProps {
  size?: number;
  className?: string;
}

// Canguru — identidade visual do sistema, usada no lugar da logo da
// empresa no Header e na tela de login (a logo da empresa continua
// aparecendo nas etiquetas impressas, que é uma marca diferente:
// a do destinatário da entrega, não a do sistema). A arte
// (public/mascot.svg) tem fundo transparente, sem badge/moldura.
export function Mascot({ size = 32, className }: MascotProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mascot.svg"
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}
