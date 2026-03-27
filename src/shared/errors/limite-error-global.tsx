import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

import { PantallaErrorGlobal } from '@/src/shared/errors/pantalla-error-global';

interface EstadoLimiteErrorGlobal {
  error: Error | null;
}

export class LimiteErrorGlobal extends Component<PropsWithChildren, EstadoLimiteErrorGlobal> {
  public state: EstadoLimiteErrorGlobal = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): EstadoLimiteErrorGlobal {
    return { error };
  }

  public componentDidCatch(error: Error, infoError: ErrorInfo) {
    console.error('Error no controlado en la interfaz', error, infoError.componentStack);
  }

  private reintentar = () => {
    this.setState({ error: null });
  };

  public render() {
    if (this.state.error) {
      return (
        <PantallaErrorGlobal descripcion={this.state.error.message} onReintentar={this.reintentar} />
      );
    }

    return this.props.children;
  }
}
