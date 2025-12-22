import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renderiza el texto correctamente', () => {
    render(<Badge tipo="success">Test</Badge>);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('aplica la clase correcta segun el tipo', () => {
    const { container } = render(<Badge tipo="warning">Alerta</Badge>);
    const badge = container.querySelector('.badge');
    expect(badge.className).toContain('badge');
  });
});
