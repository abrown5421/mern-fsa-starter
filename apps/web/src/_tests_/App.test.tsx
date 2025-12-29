import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

test('applies Tailwind full viewport width and height classes', () => {
  render(<App />);
  const el = screen.getByTestId('tailwind-check');

  expect(el).toHaveClass('w-screen', 'h-screen');
});
